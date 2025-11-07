import datetime
import sqlite3
from zoneinfo import ZoneInfo 
from fastapi.params import Depends
import pandas as pd
from sqlalchemy.orm import sessionmaker
from sqlalchemy import delete, func 
from typing import Optional, List
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from fastapi.security import OAuth2PasswordBearer

from core.schemas import UserCreate
from core.helpers import  decode_access_token, get_password_hash, parse_datetime, verify_password
from core.models import Article, User, engine

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")



SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def load_all_articles_as_df():
    session = SessionLocal()
    try:

        query = session.query(
            Article.id.label("ID"),
            Article.title.label("Título"),
            Article.url.label("URL"),
            Article.source_name.label("Fonte"),
            Article.topic.label("Tópico"),
            func.strftime('%Y-%m-%d %H:%M:%S', Article.published_at).label("published_at"),
            Article.generic_news
        ).order_by(Article.published_at.desc())

        df = pd.read_sql(query.statement, session.bind)
        return df
        
    except Exception as e:
        print(f"Ocorreu um erro ao ler o banco de dados para DataFrame: {e}")
        return pd.DataFrame(columns=[
            "ID", "Título", "URL", "Fonte", "Tópico", 
            "published_at", "generic_news"
        ])
    finally:
        session.close()

def get_articles_with_filters(
    topics: Optional[List[str]] = None,
    sources: Optional[List[str]] = None,
    title_search: Optional[str] = None,
    generic_news: Optional[bool] = None
):
    session = SessionLocal()
    try:
        query = session.query(Article)

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
        
    except Exception as e:
        print(f"Ocorreu um erro ao consultar o DB com ORM: {e}")
        return []
    finally:
        session.close()
        
def save_articles_to_db(articles, topic, generic=True):
    if not articles:
        return

    current_time = datetime.datetime.now(ZoneInfo("America/Sao_Paulo"))
    

    articles_to_insert = []

    for article in articles:
        title = article.get('title')
        url = article.get('url')
        published_at = article.get('publishedAt')

        
        if not all([title, url, published_at]):
            continue

        source = article.get('source')

            
        published_at_brazil = parse_datetime(published_at)

        article_data = {
            'title': title,
            'source_name': source['name'] if source and 'name' in source else 'Unknown',
            'url': url,
            'published_at': published_at_brazil,
            'topic': topic,
            'downloaded_at': current_time,
            'generic_news': generic
        }

        articles_to_insert.append(article_data)
        
    if(articles_to_insert == []):
        return

    with SessionLocal() as session:
        try:
            stmt = sqlite_insert(Article).values(articles_to_insert)
            stmt = stmt.on_conflict_do_nothing(index_elements=['url'])
            
            result = session.execute(stmt)
            session.commit()
            
            print(f"  > Saved {result.rowcount} new articles for '{topic}'.")
        except Exception as e:
            print(f"An error occurred during fetch: {e}")
        return []
    
def delete_old_articles(days_old):
    with SessionLocal() as session:
        try:
            # 2. Calcula a data de corte (SQLAlchemy usa objetos datetime)
            cutoff_date = datetime.datetime.now() - datetime.timedelta(days=days_old)

            # 3. Cria a consulta DELETE usando o SQLAlchemy
            # Isso é equivalente a: "DELETE FROM articles WHERE published_at < ?"
            stmt = delete(Article).where(Article.published_at < cutoff_date)
            
            # 4. Executa a consulta
            result = session.execute(stmt)
            
            # 5. Comita a transação
            session.commit()
            
            print(f"\nLimpeza do banco de dados: Excluídos {result.rowcount} artigos mais antigos que {days_old} dias.")
        
        except Exception as e:
            # Reverte em caso de erro
            session.rollback()
            print(f"Erro de banco de dados durante a exclusão: {e}")
    
def login(email: str, password: str) -> Optional[User]:
    """
    Busca um usuário por e-mail e verifica sua senha.
    
    Retorna o objeto 'User' se a autenticação for bem-sucedida,
    ou 'None' se falhar.
    """
    session = SessionLocal()

    user = session.query(User).filter(User.email == email).first()

    # 2. Verifica se o usuário existe E se a senha bate
    if not user:
        return None
    
    if not verify_password(password, user.hashed_password):
        return None

   
    return user

def get_user_by_email(email: str) -> Optional[User]:
    db = SessionLocal()
    """ Busca um usuário pelo email. """
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(username: str) -> Optional[User]:
    db = SessionLocal()
    """ Busca um usuário pelo nome de usuário. """
    return db.query(User).filter(User.username == username).first()

def create_db_user(user_in: UserCreate) -> User:
    """
    Cria o novo objeto User (modelo SQLAlchemy), hasheia a senha
    e o salva no banco.
    """
    db = SessionLocal()
    # 1. Criptografa a senha antes de salvar
    hashed_password = get_password_hash(user_in.password)

    # 2. Cria o novo objeto User
    db_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_password,
        first_name=user_in.first_name,
        last_name=user_in.last_name
    )

    # 3. Adiciona, comita e atualiza no banco
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # 4. Retorna o usuário criado
    return db_user

def get_current_user(
    token: str = Depends(oauth2_scheme),  
):
    
    user_decode = decode_access_token(token)
    user_id = user_decode['id']
    
    db = SessionLocal()    
    # Agora buscamos o usuário no DB com o ID que estava no token
    user = db.query(User).filter(User.id == user_id).first()
    
    if user is None:
        return None
    
    # Se tudo deu certo, retornamos o objeto User
    return user
                 
