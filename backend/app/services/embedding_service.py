from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

def get_embedding(text: str) -> list[float]:
    """Convert any text into a vector — free, runs locally"""
    text = text.replace("\n", " ").strip()
    embedding = model.encode(text)
    return embedding.tolist()

def get_embeddings_batch(texts: list[str]) -> list[list[float]]:
    """Convert multiple texts into vectors at once"""
    texts = [t.replace("\n", " ").strip() for t in texts]
    embeddings = model.encode(texts)
    return [e.tolist() for e in embeddings]