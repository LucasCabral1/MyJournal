# core/schemas.py

from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr
from typing import List, Optional

class Article(BaseModel):
    id: int
    title: str
    source_name: Optional[str] = None
    url: str
    published_at: datetime
    topic: str
    generic_news: bool
    user_id: int
    
    model_config = ConfigDict(from_attributes=True)
    
class User(BaseModel):
    id: int
    username: str
    email: EmailStr 
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    created_at: datetime
    is_active: bool
    is_admin: bool
    articles: List[Article] = []
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