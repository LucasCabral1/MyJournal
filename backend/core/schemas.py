# core/schemas.py

from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, HttpUrl
from typing import List, Optional

# --- Schemas de Requisição (Request) ---
# (Geralmente não têm relacionamentos)

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str
    
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None,
    newsletter_opt_in: Optional[bool] = False
    
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    newsletter_opt_in: Optional[bool] = None
    
    class Config:
        from_attributes = True
    
class Token(BaseModel):
    access_token: str
    token_type: str
    
class JournalCreateRequest(BaseModel):
    url: HttpUrl

# --- Schemas de Resposta (Response) ---
# Organizados por dependência para quebrar os loops de recursão

# PASSO 1: Schemas "Resumo" (Shallow)
# Estes schemas não têm relacionamentos complexos e são usados
# para evitar os loops.

class JournalCreateResponse(BaseModel):
    """
    Um "Resumo" de um Journal.
    Usado em 'Article' e 'User' para evitar loops.
    """
    id: int
    name: str 
    rss: str  
    url: str   
    model_config = ConfigDict(from_attributes=True)

class UserSummary(BaseModel):
    """
    Um "Resumo" de um User.
    Usado em 'Journal' para evitar loops.
    """
    id: int
    username: str
    email: EmailStr 
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class ArticleSummary(BaseModel):
    """
    Um "Resumo" de um Article.
    Usado em 'Journal' e 'User'.
    """
    id: int
    title: str
    url: str
    author: Optional[str] = None
    summary:  Optional[str] = None
    image_url: Optional[str] = None
    published_at: datetime
    topic: Optional[str] = None
    generic_news: bool
    user_id: int
    model_config = ConfigDict(from_attributes=True)


# PASSO 2: Schemas "Completos"
# Estes schemas podem carregar listas, mas eles usam
# os schemas "Resumo" para seus relacionamentos.

class Article(ArticleSummary):
    """
    Schema completo para um Artigo.
    Usado em rotas como /api/articles/me.
    """
    # Carrega o resumo do Journal, não o Journal completo.
    journal: JournalCreateResponse 
    

class User(UserSummary):
    """
    Schema completo para um Usuário.
    Usado em rotas como /api/users/me.
    """
    created_at: datetime
    is_active: bool
    is_admin: bool
    
    # Carrega resumos de Articles e Journals, quebrando os loops
    articles: List[ArticleSummary] = []
    journals: List[JournalCreateResponse] = []


class Journal(BaseModel):
    """
    Schema completo para um Journal.
    Usado em rotas como /api/journals/{id}.
    """
    id: int
    name: str
    url: str
    rss: str
    
    # Carrega resumos de Users e Articles, quebrando os loops
    users: List[UserSummary] = []
    articles: List[ArticleSummary] = []
    model_config = ConfigDict(from_attributes=True)
    
    

   

class RefreshResponse(BaseModel):
    refresh_details: dict
    articles: List[Article]