# api.py


from fastapi import Depends, FastAPI, Query, status, HTTPException
from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select


from core import models
from journal import update_feeds_for_user
from core.database import (
    create_db_user, create_journal, get_articles_with_filters, 
    get_current_user, get_db,  
    get_user_by_email, get_user_by_username, login
)
from core.helpers import create_access_token, discover_rss_feed, get_password_hash
from core.schemas import Article, JournalCreateRequest, JournalCreateResponse, RefreshResponse, User, UserCreate, UserLoginRequest , Token, Journal, UserUpdate

app = FastAPI(
    title="MyJournal API",
    description="API para acessar os artigos coletados pelo MyJournal.",
    version="1.0.0"
)
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.setup_database_orm()

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/articles/", response_model=List[Article])
def read_articles(
    db: Session = Depends(get_db),
    topics: Optional[List[str]] = Query(None),
    sources: Optional[List[str]] = Query(None),
    search: Optional[str] = Query(None, alias="title_search"),
    generic: Optional[bool] = Query(None, alias="generic_news")
):
    articles_data = get_articles_with_filters(
        db=db, 
        topics=topics,
        sources=sources,
        title_search=search,
        generic_news=generic
    )
    return articles_data

@app.post("/api/login/", response_model=Token)
def login_for_user(
    credentials: UserLoginRequest,
    db: Session = Depends(get_db)
):
    user = login( 
        db=db,
        email=credentials.email, 
        password=credentials.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={
        "email": user.email, 
        "id": user.id 
    }
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/register/", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_user(
    user_in: UserCreate,
    db: Session = Depends(get_db) 
):
    try:
        user_exists = get_user_by_email(db=db, email=user_in.email) 
        if user_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este email já está cadastrado."
            )
            
        user_exists = get_user_by_username(db=db, username=user_in.username) 
        if user_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este nome de usuário já está em uso."
            )

        db_user = create_db_user(db=db, user_in=user_in) 

        db.commit() 

        access_token = create_access_token(
            data={
                "sub": db_user.email, 
                "username": db_user.username,
                "id": db_user.id 
            }
        )

        return {"access_token": access_token, "token_type": "bearer"}
    
    except Exception as e:
        db.rollback() 
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar usuário: {e}"
        )


@app.get(
    "/api/articles/me", 
    response_model=List[Article],
)
def get_my_articles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    articles = db.query(models.Article).filter(
        models.Article.user_id == current_user.id
    ).options(
        selectinload(models.Article.journal) 
    ).order_by(
        models.Article.published_at.desc() 
    ).all()
    return articles

@app.post(
    "/api/journal", 
    response_model=JournalCreateResponse,
)
def add_user_journal(
    request_data: JournalCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    url_str = str(request_data.url).rstrip('/')

    try:
        for existing_journal in current_user.journals:
            if existing_journal.url == request_data.url:
                return existing_journal
            
        statement = select(models.Journal).where(models.Journal.url == url_str)
        journal_in_db = db.scalars(statement).first()

        if journal_in_db:
            return journal_in_db
            
        discovered_rss_url_str = discover_rss_feed(url_str)
            

        journal_to_add = create_journal(
            db=db, 
            rss_url=discovered_rss_url_str,
            url=request_data.url
        )

        current_user.journals.append(journal_to_add)
        
        db.commit()
        db.refresh(journal_to_add) 
        
        return journal_to_add

    except ValueError as e:
        db.rollback() 
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Um erro inesperado ocorreu ao associar o journal: {str(e)}"
        )
        
        
@app.get(
    "/api/journal/me", 
    response_model=List[JournalCreateResponse],
)
def get_my_articles(
    current_user: User = Depends(get_current_user)
):
    return current_user.journals

@app.post("/api/articles/me/refresh", response_model=RefreshResponse)
def update_my_journal_feeds(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:
        refresh_result = update_feeds_for_user(db=db, user=current_user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Falha ao atualizar feeds: {e}")
    
    try:
        articles_list = db.query(models.Article).filter(
            models.Article.user_id == current_user.id
        ).options(
            selectinload(models.Article.journal) 
        ).order_by(
            models.Article.published_at.desc() 
        ).all()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Falha ao buscar artigos após atualização: {e}")

    return {
        "refresh_details": refresh_result,
        "articles": articles_list
    }
    
@app.get(
    "/api/users/me", 
    response_model=User,
)
def get_my_articles(
    current_user: User = Depends(get_current_user)
):
    return current_user


@app.patch("/api/users/me", response_model=User)
def update_user_me(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    
    if user_in.email is not None and user_in.email != current_user.email:
        user_exists = get_user_by_email(db, email=user_in.email)
        if user_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este email já está em uso."
            )
        current_user.email = user_in.email

    if user_in.username is not None and user_in.username != current_user.username:
        user_exists = get_user_by_username(db, username=user_in.username)
        if user_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este nome de usuário já está em uso."
            )
        current_user.username = user_in.username


    if user_in.newsletter_opt_in is not None:
        current_user.newsletter_opt_in = user_in.newsletter_opt_in


    try:
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
        return current_user
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar perfil: {str(e)}"
        )

