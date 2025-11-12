
from datetime import datetime, timedelta, timezone
import os
import ssl
from dotenv import load_dotenv
import feedparser
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from dateutil import parser
from passlib.context import CryptContext
from jose import jwt
import feedfinder2

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
