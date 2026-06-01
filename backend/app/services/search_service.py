from app.services.pinecone_service import search_similar

def hybrid_search(query: str, top_k: int = 10) -> dict:
    """
    Perform semantic search and return ranked results
    """
    if not query or len(query.strip()) == 0:
        return {"results": [], "query": query, "total": 0}

    query = query.strip()
    results = search_similar(query, top_k=top_k)

    return {
        "query": query,
        "total": len(results),
        "results": results
    }