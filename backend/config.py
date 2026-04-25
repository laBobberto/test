from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://lifebalance:lifebalance@localhost:5432/lifebalance_db"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Omniroute AI
    OMNIROUTE_API_URL: str = "http://127.0.0.1:20128/v1/messages"
    OMNIROUTE_API_KEY: str = "sk-547afbc81b7e4079-f3578f-f1712278"
    OMNIROUTE_MODEL: str = "kr/claude-sonnet-4.5"
    
    # External APIs
    LETI_API_URL: str = "https://digital.etu.ru/api"
    EVENTS_API_URL: str = "https://researchinspb.ru/api/v1/public/event/"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    class Config:
        env_file = ".env"

settings = Settings()
