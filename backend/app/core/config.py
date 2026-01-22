# backend/app/core/config.py

from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Force-load .env before Settings initialization
load_dotenv()


class Settings(BaseSettings):
    ENV: str = "development"

    # We make these optional (with defaults) so Vercel doesn't crash on boot if they are missing.
    # The app will just fail later if used.
    API_KEY: str = "default_unsafe_key_please_change" 
    GROQ_API_KEY: str = ""
    PINECONE_API_KEY: str = ""
    PINECONE_INDEX_NAME: str = "compliance-policy"
    HUGGINGFACEHUB_API_TOKEN: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
