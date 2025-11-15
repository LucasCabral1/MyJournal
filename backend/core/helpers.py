
from datetime import datetime, timedelta, timezone
import mimetypes
import os
import ssl
import uuid
from dotenv import load_dotenv
import feedparser
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from dateutil import parser
from passlib.context import CryptContext
from jose import jwt
import feedfinder2
import trafilatura

load_dotenv()


SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"


def find_rss_feed(site_url):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
        }
        
        response = requests.get(site_url, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')
        
        rss_link = soup.find(
            'link', 
            rel='alternate', 
            type='application/rss+xml'
        )
        
        if not rss_link:
             rss_link = soup.find(
                'link', 
                rel='alternate', 
                type='application/atom+xml'
            )

        if rss_link and rss_link.get('href'):
            feed_url = rss_link.get('href')
            
            if not feed_url.startswith(('http://', 'https://')):
                feed_url = urljoin(site_url, feed_url)
            
            print(f"get url from: {feed_url}")
            return feed_url

    except requests.exceptions.RequestException as e:
        print(f"Unable to get {site_url}: {e}")
        
    
    common_paths = ['/feed/', '/rss/', '/feed', '/rss.xml', '/feed.xml']
    
    for path in common_paths:
        test_url = urljoin(site_url, path)
        
        try:
            test_response = requests.head(test_url, headers=headers, timeout=5, allow_redirects=True)
            if test_response.status_code == 200:
                print(f"get url from: {test_url}")
                return test_url
        except requests.exceptions.RequestException:
            continue

    return None

def parse_datetime(date_string: str | None) -> datetime | None:
    if not date_string or not isinstance(date_string, str):
        return None
        
    try:
        return parser.parse(date_string)
        
    except (parser.ParserError, ValueError):
        print(f"error to parse date: {date_string}")
        return None
    
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha em texto puro corresponde à senha hashed."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Gera o hash de uma senha em texto puro."""
    pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
    return pwd_context.hash(password)

def create_access_token(data: dict):
    """
    Cria um novo token de acesso JWT com expiração fixa de 5 horas.
    
    :param data: Um dicionário contendo os dados para incluir no payload do token.
                 É comum usar a chave 'sub' (subject) para o identificador do usuário (ex: email).
    :return: Uma string contendo o token JWT codificado.
    """
    to_encode = data.copy()
    
    # Define o tempo de expiração fixo para 5 horas
    expire = datetime.now(timezone.utc) + timedelta(hours=5)
        
    to_encode.update({"exp": expire})
    
    # Gera o token JWT
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        print("Token expirado.")
        return None
    except jwt.JWTError:
        print("Token inválido.")
        return None
    
def validate_and_parse_feed(rss_url: str) -> str:  

    if hasattr(ssl, '_create_unverified_context'):
        ssl._create_default_https_context = ssl._create_unverified_context

    try:
        feed = feedparser.parse(rss_url)

        if feed.bozo:
            raise ValueError(f"Jornal indisponível ou inválido: {rss_url}")

        feed_title = feed.feed.get("title")
        if not feed_title:
            raise ValueError("Jornal indisponível ou inválido: {rss_url}")

        return feed_title

    except Exception as e:
        if isinstance(e, ValueError):
            raise e
        
        raise ValueError(f"Jornal indisponível ou inválido: {rss_url}")
    

def discover_rss_feed(website_url: str) -> str:
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        feeds = feedfinder2.find_feeds(website_url, user_agent=headers['User-Agent'])
        
        if not feeds:
            raise ValueError(f"Nenhum feed RSS pôde ser encontrado em '{website_url}'")
        
        return feeds[0]
        
    except requests.exceptions.RequestException as e:
        raise ValueError(f"Erro de rede ao tentar acessar '{website_url}': {e}")
    
    
def fetch_article_content_and_og_image(url):

    content = None
    og_image = None
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0',
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Cache-Control": "max-age=0",
            "referer": "https://www.google.com"
        }
        response = requests.get(url, headers=headers, timeout=20) 
        response.raise_for_status()
        html_content = response.text


        content = trafilatura.extract(html_content, include_comments=False, include_tables=False)

        # 2. Extract og:image using BeautifulSoup
        soup = BeautifulSoup(html_content, 'lxml') # Use lxml ou html.parser
        og_image_tag = soup.find('meta', property='og:image')
        
        if og_image_tag and og_image_tag.get('content'):
            og_image = og_image_tag['content']
            # Resolve URLs relativas (ex: /images/foo.jpg)
            og_image = urljoin(url, og_image)

        return {'content': content, 'og_image': og_image}

    except requests.exceptions.RequestException as e:
        print(f"Error fetching {url}: {e}")
        return {'content': None, 'og_image': None}
    except Exception as e:
        print(f"Error processing content/og:image from {url}: {e}")
        return {'content': content, 'og_image': None}
    
    
def processar_artigo_e_baixar_og_image(entry):
    # Pega o link do artigo direto da entrada do feed
    article_url = entry.link
    
    # 1. Chama sua função para obter os dados da página
    print(f"Buscando conteúdo/imagem de: {article_url}")
    dados_pagina = fetch_article_content_and_og_image(article_url)
    
    article_content = dados_pagina['content']
    original_image_url = dados_pagina['og_image']
    
    db_image_path = None

    # 2. Lógica de Download (adaptada da nossa conversa anterior)
    
    # Verifica se a URL é válida (começa com http) E não é None
    is_valid_download_url = original_image_url and (
        original_image_url.startswith('http://') or 
        original_image_url.startswith('https://')
    )

    if is_valid_download_url:
        try:
            # Headers simples, apenas para o download da imagem
            image_headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
                'Referer': article_url # Boa prática
            }
            
            response = requests.get(original_image_url, headers=image_headers, stream=True, timeout=10)
            response.raise_for_status()

            content_type = response.headers.get('content-type')
            ext = mimetypes.guess_extension(content_type)
            if not ext or ext == '.jpe': 
                ext = '.jpg'
            elif content_type == 'image/svg+xml':
                ext = '.svg'

            filename = f"{uuid.uuid4()}{ext}"
            SAVE_DIR = "static/articles_images"

        
            os.makedirs(SAVE_DIR, exist_ok=True)
            
 
            save_path = os.path.join(SAVE_DIR, filename)
            
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192): 
                    f.write(chunk)
            
            db_image_path = f"/static/articles_images/{filename}" 
            print(f"Sucesso! Imagem salva em: {save_path}")

        except requests.exceptions.RequestException as e:
            print(f"Erro ao baixar imagem (requests): {original_image_url} - {e}")
        except Exception as e:
            print(f"Erro inesperado ao salvar imagem: {original_image_url} - {e}")
    
    elif original_image_url:
        print(f"Ignorando URL de imagem inválida ou 'data URI': {original_image_url[:70]}...")
    else:
        print(f"Nenhuma og:image encontrada para: {article_url}")

    # 3. Retorna o dicionário final para seu script principal
    return {
        'content': article_content, 
        'image_path': db_image_path
    }
