import os
from pathlib import Path
from sqlalchemy import DateTime, ForeignKey, Table, create_engine, Column, Integer, String, Boolean, func
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import relationship
from dotenv import load_dotenv
load_dotenv()

Base = declarative_base()
BASE_DIR = Path(__file__).resolve().parent 


DB_FILENAME = os.getenv("DB_NAME") 


DB_PATH = BASE_DIR / DB_FILENAME 


DATABASE_URL = f"sqlite:///{DB_PATH}"

user_journal_association = Table('user_journal_association', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('journal_id', Integer, ForeignKey('journals.id'), primary_key=True)
)

class Article(Base):
    __tablename__ = 'articles'

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    url = Column(String, nullable=False, unique=True)
    published_at = Column(DateTime, nullable=False)
    topic = Column(String, nullable=True)
    summary = Column(String, nullable=True)
    author = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    downloaded_at = Column(DateTime, nullable=False)
    generic_news = Column(Boolean)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="articles")
    journal_id = Column(Integer, ForeignKey("journals.id"), nullable=False)
    journal = relationship("Journal", back_populates="articles")

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(50))
    last_name = Column(String(50))
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    articles = relationship("Article", back_populates="user")
    journals = relationship("Journal",
                            secondary=user_journal_association,
                            back_populates="users")
    
    
class Journal(Base):
    __tablename__ = 'journals'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, index=True)
    url = Column(String, nullable=False, index=True)
    rss = Column(String, unique=True, nullable=False) 


    users = relationship("User",
                         secondary=user_journal_association,
                         back_populates="journals")
    
    articles = relationship("Article", back_populates="journal")
    
engine = create_engine(DATABASE_URL)

def setup_database_orm():
    Base.metadata.create_all(bind=engine)