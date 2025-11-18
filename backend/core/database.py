# core/database.py

import datetime
import sqlite3
from zoneinfo import ZoneInfo 
from fastapi.params import Depends
import pandas as pd
# Importações necessárias do SQLAlchemy e FastAPI
from sqlalchemy.orm import sessionmaker, Session 
from sqlalchemy import delete, func, select 
from typing import Optional, List
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from fastapi.security import OAuth2PasswordBearer
from fastapi import HTTPException, status

from core.schemas import UserCreate
from core.helpers import  decode_access_token, get_password_hash, parse_datetime, validate_and_parse_feed, verify_password
from core.models import Article, User, engine, Journal

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db 
    finally:
        db.close()



def get_articles_with_filters(
    db: Session, 
    topics: Optional[List[str]] = None,
    sources: Optional[List[str]] = None,
    title_search: Optional[str] = None,
    generic_news: Optional[bool] = None
):
    
    query = db.query(Article) # Usa o 'db' recebido

    if topics:
        query = query.filter(Article.topic.in_(topics))
    
    if sources:
        query = query.filter(Article.source_name.in_(sources))
    
    if title_search:
        query = query.filter(func.lower(Article.title).like(f"%{title_search.lower()}%"))
        
    if generic_news is not None:
        query = query.filter(Article.generic_news == generic_news)
        
    articles = query.order_by(Article.published_at.desc()).all()
    
    return articles
        
    
def save_articles_to_db(db: Session, articles: List[dict], journal_id: int, user_id: int, generic: bool = True) -> int:
    if not articles:
        return 0

    try:
        tz_sp = ZoneInfo("America/Sao_Paulo")
    except Exception:
        tz_sp = datetime.timezone(datetime.timedelta(hours=-3))
        
    current_time = datetime.datetime.now(tz_sp)
    articles_to_insert = []

    for article in articles:
        title = article.get('title')
        url = article.get('url')
        published_at_str = article.get('publishedAt') 
        topic = article.get('topic') 
        img = article.get('image_url')
        summary = article.get('summary', None)
        author = article.get('author', None)

        if not all([title, url, published_at_str]):
            print(f"  > Pulando artigo inválido (dados ausentes): {title}")
            continue
        
     
        published_at_brazil = parse_datetime(published_at_str)

        article_data = {
            'title': title,
            'journal_id': journal_id,
            'user_id': user_id, 
            'url': url,
            'published_at': published_at_brazil,
            'topic': topic,
            'downloaded_at': current_time,
            'generic_news': generic,
            'image_url': img,
            'summary': summary,
            'author': author
        }
        articles_to_insert.append(article_data)
        
    if not articles_to_insert:
        print("  > Nenhum artigo novo para inserir (todos filtrados ou inválidos).")
        return 0

    try:

        stmt = sqlite_insert(Article).values(articles_to_insert)
        stmt = stmt.on_conflict_do_nothing(index_elements=['url'])
        
        result = db.execute(stmt)
        db.commit() 
        
        print(f"  > Salvos {result.rowcount} novos artigos.")
        return result.rowcount 
        
    except Exception as e:
        print(f"  > [ERRO] Falha ao salvar artigos no banco: {e}")
        db.rollback() 
        return 0 


def delete_old_articles(days_old):
    with SessionLocal() as session:
        try:
            cutoff_date = datetime.datetime.now() - datetime.timedelta(days=days_old)
            
            stmt = delete(Article).where(Article.published_at < cutoff_date)
            
            result = session.execute(stmt)
            
            session.commit()
            
            print(f"\nLimpeza do banco de dados: Excluídos {result.rowcount} artigos mais antigos que {days_old} dias.")
        
        except Exception as e:
            session.rollback()
            print(f"Erro de banco de dados durante a exclusão: {e}") 

def login(db: Session, email: str, password: str) -> Optional[User]:
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return None
    
    if not verify_password(password, user.hashed_password):
        return None

    return user

def get_user_by_email(db: Session, email: str) -> Optional[User]: 
   
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str) -> Optional[User]: 
    return db.query(User).filter(User.username == username).first()

def create_db_user(db: Session, user_in: UserCreate) -> User: 
    hashed_password = get_password_hash(user_in.password)

    db_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_password,
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        newsletter_opt_in=user_in.newsletter_opt_in
    )

    db.add(db_user)
    db.flush()
    db.refresh(db_user)

    return db_user

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db) 
):
    try:
        user_decode = decode_access_token(token)
        user_id = user_decode['id']
    except Exception:
         raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    

    user = db.query(User).filter(User.id == user_id).first() 
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )
    
    return user

def create_journal(
    db: Session,
    rss_url: str,
    url: str
):
   
    statement = select(Journal).where(Journal.rss == rss_url)
    journal_in_db = db.scalars(statement).first()

    if journal_in_db:
        return journal_in_db

    try:
        feed_title = validate_and_parse_feed(rss_url)
    except ValueError as e:
        raise e 

    new_journal = Journal(
        name=feed_title,
        rss=rss_url,
        url=url
        
    )
    db.add(new_journal)
    
    db.flush() 
    db.refresh(new_journal)
    
    return new_journal