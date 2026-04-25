from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./lifebalance.db"
    
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
    
    # Weather API
    OPENWEATHER_API_KEY: str = "5814a429e169590c4ac15e1d08d0ebb5"
    OPENWEATHER_API_URL: str = "https://api.openweathermap.org/data/2.5"
    
    # Yandex Maps API
    YANDEX_MAPS_API_KEY: str = "5a5c211d-0ae2-46ec-b0d9-da08e89ebddf"
    YANDEX_GEOCODER_URL: str = "https://geocode-maps.yandex.ru/1.x/"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    class Config:
        env_file = ".env"

settings = Settings()
