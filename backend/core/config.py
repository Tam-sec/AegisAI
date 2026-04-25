from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path

_ENV_FILE = Path(__file__).resolve().parent.parent.parent / ".env"


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./data/hr_app.db"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "gemma4"
    OLLAMA_EMBED_MODEL: str = "nomic-embed-text"
    OLLAMA_TIMEOUT: int = 120
    SECRET_KEY: str = "dev-secret-key"
    ENCRYPTION_KEY: str = ""
    ADMIN_USERNAME: str = "tamer"
    ADMIN_PASSWORD: str = "tamer"
    APP_ENV: str = "development"
    CORS_ORIGINS: str = "http://localhost:3000"
    UPLOAD_DIR: str = "./data/uploads"
    MAX_UPLOAD_SIZE_MB: int = 25
    DATA_RETENTION_DAYS: int = 365

    model_config = {
        "env_file": str(_ENV_FILE),
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


@lru_cache()
def get_settings():
    return Settings()
