from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Semantic Search Engine"
    DEBUG: bool = True
    OPENAI_API_KEY: str = "not-needed"
    PINECONE_API_KEY: str
    PINECONE_INDEX_NAME: str = "semantic-search"

    class Config:
        env_file = ".env"

settings = Settings()