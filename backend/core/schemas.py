# core/schemas.py

from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional

class Article(BaseModel):
    id: int
    title: str
    source_name: Optional[str] = None
    url: str
    published_at: str
    topic: str
    generic_news: bool
    
    model_config = ConfigDict(from_attributes=True)
    
class User(BaseModel):
    id: int
    username: str
    email: EmailStr  # Valida o formato do e-mail
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    created_at: datetime
    is_active: bool
    is_admin: bool

 
    model_config = ConfigDict(from_attributes=True)
    
class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str
    
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    
class Token(BaseModel):
    access_token: str
    token_type: str