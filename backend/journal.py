import mimetypes
import os
import sqlite3
import uuid
from bs4 import BeautifulSoup
import requests
import datetime
import time
from dotenv import load_dotenv
import feedparser
from email.utils import mktime_tz, parsedate_tz

import urllib

from core.database import SessionLocal, create_journal, delete_old_articles, save_articles_to_db
from core import models 

load_dotenv()

# --- CONFIGURATION ---
API_KEY = os.getenv("API_KEY")
DB_NAME = "my_journal.db"
NEWS_LIMIT_PER_TOPIC = 10
DAYS_TO_KEEP_ARTICLES = 30
STATIC_DIR = "static/article_images"
os.makedirs(STATIC_DIR, exist_ok=True)



def fetch_news(api_key, query_value, limit, search_type='topic'):
    params = {
        'token': api_key,
        'lang': 'pt',
        'country': 'br',
        'max': limit,
    }

    if search_type == 'topic':
        base_url = "https://gnews.io/api/v4/top-headlines"
        params['category'] = query_value
    elif search_type == 'site':
        base_url = "https://gnews.io/api/v4/search"
        params['q'] = f'site:{query_value}'
    else:
        print(f"Tipo de busca inválido: {search_type}")
        return []

    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status() 
        data = response.json()
        
        return data.get('articles', [])
            
    except requests.exceptions.RequestException as e:
        print(f"HTTP Request failed: {e}")
        return []
    except Exception as e:
        print(f"An error occurred during fetch: {e}")
        return []

def format_rss_time_to_iso(time_string):
    try:
        time_tuple_with_tz = parsedate_tz(time_string)
        timestamp = mktime_tz(time_tuple_with_tz)
        dt_object = datetime.datetime.fromtimestamp(timestamp)
        return dt_object.isoformat()
    except Exception:
        return datetime.datetime.now().isoformat()

def fetch_news_from_rss(feed_url, limit):
    try:
        feed = feedparser.parse(feed_url)
        articles_list = []
        
        for entry in feed.entries[:limit]:
            
            published_time = entry.get('published', datetime.datetime.now().isoformat())
            
            if not published_time.endswith('Z') and '+' not in published_time:
                 published_time_iso = format_rss_time_to_iso(published_time)
            else:
                 published_time_iso = published_time
                 
            topic = None
            if entry.get('tags'):
                topic = entry.tags[0].get('term')
                
            author = entry.get('author', None)
            
            summary_text = None

            summary_html = entry.get('summary', entry.get('description', ''))
            
            if summary_html:
                soup = BeautifulSoup(summary_html, 'html.parser')
                summary_text = soup.get_text(separator=" ", strip=True)

    
            original_image_url = None


            if entry.get('media_content'):
                media_images = [
                    m.get('url') for m in entry.media_content 
                    if m.get('medium') == 'image' and m.get('url')
                ]
                if media_images: original_image_url = media_images[0]


            if not original_image_url and entry.get('enclosures'):
                enclosure_images = [
                    e.get('href') for e in entry.enclosures 
                    if e.get('type', '').startswith('image/') and e.get('href')
                ]
                if enclosure_images: original_image_url = enclosure_images[0]

  
            if not original_image_url:
                html_content = ""
                if entry.get('content'):
                    html_content = entry.content[0].get('value', '')
                elif entry.get('summary'):
                    html_content = entry.get('summary', '')

                if html_content:

                    soup = BeautifulSoup(html_content, 'html.parser')
                    img_tag = soup.find('img')
                    if img_tag and img_tag.get('src'):
                        original_image_url = img_tag.get('src')

    
            db_image_url = None 
    
            if original_image_url:
                try:
                    hdr = {'User-Agent': 'Mozilla/5.0'}
                    req = urllib.request.Request(original_image_url, headers=hdr)

                    with urllib.request.urlopen(req, timeout=10) as response:
                        
                        image_bytes = response.read()


                        content_type = response.info().get_content_type()
                        

                        ext = mimetypes.guess_extension(content_type)
                        

                        if not ext:
                            if content_type == 'image/svg+xml': ext = '.svg'
                            else: ext = '.jpg' 
                        
                        filename = f"{uuid.uuid4()}{ext}"
                        save_path = os.path.join(STATIC_DIR, filename)
                        
                        with open(save_path, 'wb') as f:
                            f.write(image_bytes)
                        
                        db_image_url = f"/static/article_images/{filename}" 
        
                except (urllib.error.URLError, ValueError, TimeoutError) as e:
                    print(f"Erro ao baixar imagem: {original_image_url} - {e}")
                    db_image_url = None
                except Exception as e:
                    print(f"Erro inesperado ao processar imagem: {original_image_url} - {e}")
                    db_image_url = None

            article = {
                'title': entry.get('title'),
                'source': {'name': feed.feed.get('title', 'RSS Source')},
                'url': entry.get('link'),
                'publishedAt': published_time_iso,
                'topic': topic,      
                'image_url': db_image_url,
                'summary': summary_text,
                'author': author   
            }
            articles_list.append(article)
            
        return articles_list
        
    except Exception as e:
        print(f"An error occurred during RSS fetch: {e}")
        return []




def update_feeds_for_user(db: requests.Session, user: models.User):
    print(f"Iniciando atualização de feeds para o usuário: {user.id} ({user.email})")
    total_articles_saved = 0
    

    for journal in user.journals:
        if not journal.rss:
            print(f"  > Pulando Journal ID {journal.id} (sem RSS URL)")
            continue

        print(f"\n- Processando Journal: '{journal.name}' (ID: {journal.id})")
        print(f"  > URL RSS: {journal.rss}")
        
        articles = fetch_news_from_rss(journal.rss, NEWS_LIMIT_PER_TOPIC)
        
        if not articles:
            print("  > Nenhum artigo novo encontrado.")
            continue
        
        try:
            num_saved = save_articles_to_db(
                db=db,
                articles=articles,  
                journal_id=journal.id, 
                generic=False,
                user_id=user.id 
            )
            
            
            if num_saved is None:
                num_saved = len(articles) 
                
            print(f"  > {num_saved} novos artigos salvos.")
            total_articles_saved += num_saved
        
        except Exception as e:
            print(f"  > [ERRO] Falha ao salvar artigos para o journal {journal.id}: {e}")
            
        
        time.sleep(1)

    print(f"\nAtualização concluída para o usuário {user.id}. Total de {total_articles_saved} novos artigos salvos.")
    
    return {
        "status": "success", 
        "user_id": user.id, 
        "new_articles_found": total_articles_saved
    }