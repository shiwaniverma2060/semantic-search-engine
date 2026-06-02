from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import search, ingest

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered semantic search engine",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(search.router, tags=["Search"])
app.include_router(ingest.router, tags=["Ingest"])

@app.get("/")
def root():
    return {"message": "Semantic Search Engine API is running!"}

@app.get("/health")
def health():
    return {"status": "healthy", "app": settings.APP_NAME}