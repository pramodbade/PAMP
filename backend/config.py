from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://pamp_user:pamp_pass@localhost:5432/pamp_db"
    secret_key: str = "change-this-secret-key-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480  # 8 hours

    class Config:
        env_file = ".env"


settings = Settings()
