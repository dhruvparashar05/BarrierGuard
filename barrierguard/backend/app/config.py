import os
from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    PROJECT_NAME: str = "BarrierGuard - SIF Precursor Intelligence Engine"
    API_PREFIX: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "barrierguard-sih-oil-super-secret-key-2025")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours for demo ease

    # Database: Default to SQLite for zero-setup execution, switches to PostgreSQL if DATABASE_URL is set
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{Path(__file__).resolve().parent.parent.parent / 'barrierguard.db'}"
    )

    # CORS
    CORS_ORIGINS: list[str] = ["*"]

    # LLM Settings
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "MOCK")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    class Config:
        case_sensitive = True

settings = Settings()
