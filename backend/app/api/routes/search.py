from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.search_service import hybrid_search

router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    top_k: int = 10

class SearchResponse(BaseModel):
    query: str
    total: int
    results: list[dict]

@router.post("/search", response_model=SearchResponse)
def search(request: SearchRequest):
    """Search for documents using semantic search"""
    if not request.query.strip():
        raise HTTPException(
            status_code=400,
            detail="Query cannot be empty"
        )
    try:
        results = hybrid_search(
            query=request.query,
            top_k=request.top_k
        )
        return results
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Search failed: {str(e)}"
        )

@router.get("/search")
def search_get(query: str, top_k: int = 10):
    """Search via GET request"""
    try:
        results = hybrid_search(query=query, top_k=top_k)
        return results
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Search failed: {str(e)}"
        )
@router.get("/stats")
def get_stats():
    """Get index statistics"""
    try:
        from app.services.pinecone_service import index
        stats = index.describe_index_stats()
        return {
            "total_documents": stats.total_vector_count,
            "dimensions": 384,
            "model": "MiniLM-L6-v2",
            "search_type": "Semantic"
        }
    except Exception as e:
        return {
            "total_documents": 0,
            "dimensions": 384,
            "model": "MiniLM-L6-v2",
            "search_type": "Semantic"
        }