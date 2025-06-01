from pydantic_settings import BaseSettings
from typing import Optional
from pydantic import Field
import os
from dotenv import load_dotenv

# Load .env file explicitly to override system environment
load_dotenv(override=True)

class Settings(BaseSettings):
    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AI Incident Transferability Forecasting"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000"]  # Frontend URL
    
    # OpenAI settings
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_BASE_URL: Optional[str] = None
    
    # Database settings
    DATABASE_URL: str = "sqlite:///./app.db"
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = 'utf-8'
        extra = "allow"  # Allow extra fields to prevent validation errors
        # Priority: .env file takes precedence over system environment
        env_prefix = ""

settings = Settings() 