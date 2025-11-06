from fastapi import FastAPI, Query, status, HTTPException
from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware


from core.helpers import create_access_token, get_password_hash
from core.database import create_db_user, get_articles_with_filters, get_user_by_email, get_user_by_username, login 
from core.schemas import Article, UserCreate, UserLoginRequest , Token

app = FastAPI(
    title="MyJournal API",
    description="API para acessar os artigos coletados pelo MyJournal.",
    version="1.0.0"
)
origins = [
    "http://localhost:3000", # Porta padrão do Create React App
    "http://localhost:5173", # Porta padrão do Vite
    "http://localhost:5174", # Outra porta comum do Vite
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Permite estas origens
    allow_credentials=True,    # Permite cookies
    allow_methods=["*"],       # Permite todos os métodos (GET, POST, etc.)
    allow_headers=["*"],       # Permite todos os cabeçalhos
)

@app.get("/articles/", response_model=List[Article])
def read_articles(
    topics: Optional[List[str]] = Query(None),
    sources: Optional[List[str]] = Query(None),
    search: Optional[str] = Query(None, alias="title_search"),
    generic: Optional[bool] = Query(None, alias="generic_news")
):
    articles_data = get_articles_with_filters(
        topics=topics,
        sources=sources,
        title_search=search,
        generic_news=generic
    )
    return articles_data

@app.post("/api/login/", response_model=Token)
def login_for_user(
    credentials: UserLoginRequest
):
    """
    Autentica um usuário e retorna seus dados.
    """
    user = login( 
        email=credentials.email, 
        password=credentials.password
    )
    
    # Se 'authenticate_user' retornar None, o login falhou.
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"}, # Padrão para login
        )
    
    access_token = create_access_token(
        data={
        "email": user.email, 
        "id": user.id 
    }
    )
    
    # Retorna o token para o cliente
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/register/", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_user(
    user_in: UserCreate
):
    """
    Cria (registra) um novo usuário e retorna um token de acesso.
    """
    
    # 1. Verifica se o email já está em uso (usando o serviço)
    user_exists = get_user_by_email(email=user_in.email)
    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este email já está cadastrado."
        )
        
    # 2. Verifica se o username já está em uso (usando o serviço)
    user_exists = get_user_by_username(username=user_in.username)
    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este nome de usuário já está em uso."
        )

    # 3. Cria o usuário no banco (usando o serviço)
    # Esta função agora lida com o hash da senha e o db.commit()
    db_user = create_db_user(user_in=user_in)

    # 4. Cria o token de acesso para o novo usuário
    access_token = create_access_token(
        data={
            "sub": db_user.email, 
            "username": db_user.username,
            "id": db_user.id 
        }
    )

    # 5. Retorna o token
    return {"access_token": access_token, "token_type": "bearer"}
   