from pinecone import Pinecone
from app.core.config import settings
from app.services.embedding_service import get_embedding
import uuid

pc = Pinecone(api_key=settings.PINECONE_API_KEY)
index = pc.Index(settings.PINECONE_INDEX_NAME)

def upsert_document(text: str, metadata: dict) -> str:
    """Store a document's vector in Pinecone"""
    doc_id = str(uuid.uuid4())
    embedding = get_embedding(text)
    index.upsert(vectors=[{
        "id": doc_id,
        "values": embedding,
        "metadata": {
            **metadata,
            "text": text[:1000]
        }
    }])
    return doc_id

def search_similar(query: str, top_k: int = 10) -> list[dict]:
    """Find most similar documents to a query"""
    query_embedding = get_embedding(query)
    results = index.query(
        vector=query_embedding,
        top_k=top_k,
        include_metadata=True
    )
    return [
        {
            "id": match.id,
            "score": round(match.score, 4),
            "text": match.metadata.get("text", ""),
            "title": match.metadata.get("title", "Untitled"),
            "source": match.metadata.get("source", ""),
        }
        for match in results.matches
    ]