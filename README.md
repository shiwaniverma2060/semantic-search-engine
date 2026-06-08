#  Semantic Search Engine

### AI-powered search that understands *meaning*, not just keywords

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-667eea?style=for-the-badge&logo=vercel)](https://semantic-search-engine-liart.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend%20API-Railway-764ba2?style=for-the-badge&logo=railway)](https://semantic-search-engine-production-c615.up.railway.app/docs)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/shiwaniverma2060/semantic-search-engine)

![Tech Stack](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Pinecone](https://img.shields.io/badge/Pinecone-Vector%20DB-00A67E?style=flat)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)

</div>

---

## What Is This?

Most search engines match **exact keywords**. Type "automobile repair" — it finds "automobile repair". Miss the exact word? Miss the result.

This project solves that. It uses **AI vector embeddings** to understand the *semantic meaning* behind your query. Search "how do cars get fixed" — it finds documents about "automobile maintenance" even though not a single word matched.

This is the same technology powering **Notion AI search**, **Spotify recommendations**, and **Google's semantic understanding layer**.

**[→ Try it live](https://semantic-search-engine-liart.vercel.app)**

---

## Key Features

| Feature | Description |
|---|---|
|  **Semantic Search** | Understands meaning using 384-dimensional vector embeddings |
|  **Multi-format Upload** | Index PDF, DOCX, and TXT files — drag and drop supported |
|  **Real-time Indexing** | Documents become searchable instantly after upload |
|  **Relevance Scoring** | Every result scored by semantic similarity (High / Med / Low) |
|  **Search History** | Recent queries stored for quick re-search |
|  **Live Stats** | Real-time document count, model info, dimensions |
| **Production Deployed** | Frontend on Vercel, Backend on Railway — live 24/7 |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER BROWSER                            │
│              React + TypeScript Frontend                    │
│         (Vercel — semantic-search-engine.vercel.app)        │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP REST API
┌─────────────────────▼───────────────────────────────────────┐
│                  FastAPI BACKEND                             │
│              (Railway — railway.app)                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Search Pipeline                         │   │
│  │                                                     │   │
│  │  Query → Query Processor → Embedding Model          │   │
│  │                              ↓                      │   │
│  │                    384-dim Vector                   │   │
│  │                              ↓                      │   │
│  │               Pinecone ANN Search                   │   │
│  │                              ↓                      │   │
│  │            Ranked Results (cosine similarity)       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Ingestion Pipeline                      │   │
│  │                                                     │   │
│  │  File Upload (PDF/DOCX/TXT)                         │   │
│  │       → Text Extraction (pypdf, python-docx)        │   │
│  │       → Chunking & Cleaning                         │   │
│  │       → Embedding Generation (MiniLM-L6-v2)         │   │
│  │       → Upsert to Pinecone Vector DB                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  PINECONE VECTOR DB                         │
│         Index: semantic-search (384 dimensions)             │
│         Metric: Cosine Similarity                           │
│         Cloud: AWS us-east-1                                │
└─────────────────────────────────────────────────────────────┘
```

---

## How Semantic Search Works

Traditional keyword search is simple — it looks for exact word matches. Semantic search is fundamentally different.

### Step 1: Text → Numbers (Embeddings)

Every piece of text gets converted into a list of 384 numbers called a **vector embedding**. These numbers capture the *meaning* of the text.

```python
"Neural networks learn from data"
→ [0.021, -0.045, 0.103, 0.067, ...]  # 384 numbers
```

Texts with similar meanings produce vectors that are mathematically close to each other.

### Step 2: Query → Vector

When you search, your query is converted into a vector using the same model.

```
"how do AI systems learn"
→ vector [0.019, -0.041, 0.098, ...]
```

### Step 3: Nearest Neighbor Search

Pinecone finds the documents whose vectors are most similar to your query vector using **cosine similarity** — a mathematical measure of directional similarity in high-dimensional space.

```
similarity = cos(angle between two vectors)
1.0 = identical meaning
0.0 = completely unrelated
```

### Step 4: Ranked Results

Results are returned sorted by similarity score with labels:
- **High (70%+)** — Strongly relevant
- **Med (50-70%)** — Moderately relevant  
- **Low (<50%)** — Loosely related

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose | Why This Choice |
|---|---|---|
| **FastAPI** | REST API framework | Fastest Python framework, async support, auto-generates OpenAPI docs |
| **sentence-transformers** | AI embedding model | Free, runs locally, no API costs, production-quality embeddings |
| **MiniLM-L6-v2** | Embedding model | 384-dimensional vectors, excellent speed/accuracy tradeoff |
| **Pinecone** | Vector database | Purpose-built for ANN search, millisecond query times at scale |
| **pypdf** | PDF text extraction | Reliable PDF parsing library |
| **python-docx** | DOCX text extraction | Official Microsoft Word document parser |
| **uvicorn** | ASGI server | Production-grade async Python server |

### Frontend
| Technology | Purpose | Why This Choice |
|---|---|---|
| **React 18** | UI framework | Industry standard, component reusability, virtual DOM |
| **TypeScript** | Type safety | Catches bugs at compile time, better IDE support |
| **Axios** | HTTP client | Better error handling than fetch, request interceptors |
| **CSS3** | Styling | Custom glassmorphism design, no framework dependency |

### Infrastructure
| Service | Purpose |
|---|---|
| **Railway** | Backend deployment — auto-deploys on git push |
| **Vercel** | Frontend deployment — CDN, instant global deployment |
| **GitHub** | Version control + CI/CD trigger |
| **Pinecone Cloud** | Managed vector database — AWS us-east-1 |

---

## Project Structure

```
semantic-search-engine/
├── backend/                          # FastAPI Python backend
│   ├── app/
│   │   ├── main.py                   # FastAPI app entry point, CORS config
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── search.py         # GET /search, POST /search, GET /stats
│   │   │       └── ingest.py         # POST /ingest, POST /ingest-file
│   │   ├── services/
│   │   │   ├── embedding_service.py  # Text → vector using MiniLM-L6-v2
│   │   │   ├── pinecone_service.py   # Vector upsert + ANN search
│   │   │   └── search_service.py     # Search orchestration layer
│   │   └── core/
│   │       └── config.py             # Environment variables, settings
│   ├── requirements.txt              # Python dependencies
│   ├── Procfile                      # Railway start command
│   └── railway.json                  # Railway deployment config
│
├── frontend/                         # React TypeScript frontend
│   ├── src/
│   │   ├── App.tsx                   # Main app component, all UI logic
│   │   ├── App.css                   # Glassmorphism design system
│   │   └── index.tsx                 # React root, app entry point
│   ├── package.json                  # Node dependencies
│   └── tsconfig.json                 # TypeScript configuration
│
└── .gitignore                        # Excludes .env, venv, node_modules
```

---

## API Reference

### Search Documents
```http
GET /search?query=neural+networks&top_k=10
```
```json
{
  "query": "neural networks",
  "total": 5,
  "results": [
    {
      "id": "3346ac23-2a2d-412c-b0e2",
      "score": 0.8241,
      "title": "Introduction to Neural Networks",
      "text": "Neural networks are computing systems...",
      "source": "https://example.com/neural-networks"
    }
  ]
}
```

### Index a Text Document
```http
POST /ingest
Content-Type: application/json

{
  "title": "Introduction to Neural Networks",
  "text": "Neural networks are computing systems...",
  "source": "https://example.com"
}
```
```json
{
  "id": "3346ac23-2a2d-412c-b0e2",
  "message": "Document indexed successfully"
}
```

### Upload a File (PDF/DOCX/TXT)
```http
POST /ingest-file
Content-Type: multipart/form-data

file: <binary>
title: "My Research Paper"
source: "https://arxiv.org/abs/..."
```

### Get Index Statistics
```http
GET /stats
```
```json
{
  "total_documents": 17,
  "dimensions": 384,
  "model": "MiniLM-L6-v2",
  "search_type": "Semantic"
}
```

---

##  Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Pinecone account (free tier)

### Backend Setup

```bash
# Clone repository
git clone https://github.com/shiwaniverma2060/semantic-search-engine.git
cd semantic-search-engine/backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and add your Pinecone API key

# Start backend server
uvicorn app.main:app --reload
# API running at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm start
# App running at http://localhost:3000
```

### Environment Variables

```env
PINECONE_API_KEY=your_pinecone_key_here
PINECONE_INDEX_NAME=semantic-search
OPENAI_API_KEY=not-needed
```

---

##  Deployment

### Backend → Railway

1. Connect GitHub repo to Railway
2. Set root directory to `backend`
3. Add environment variables in Railway dashboard
4. Auto-deploys on every `git push`

### Frontend → Vercel

1. Import GitHub repo to Vercel
2. Set root directory to `frontend`
3. Add environment variable: `REACT_APP_API_URL=your-railway-url`
4. Auto-deploys on every `git push`

---

##  Key Engineering Decisions

### Why sentence-transformers over OpenAI embeddings?

OpenAI's embedding API costs money per request and has rate limits. `sentence-transformers` runs completely locally with zero API costs. For a portfolio project that may receive unexpected traffic, the free local model is more resilient. The MiniLM-L6-v2 model produces 384-dimensional vectors with excellent semantic quality for its size.

### Why Pinecone over a SQL database?

Traditional SQL databases like PostgreSQL can store text but cannot efficiently perform similarity search across millions of vectors. Pinecone is purpose-built for **Approximate Nearest Neighbor (ANN)** search — finding the most similar vectors in milliseconds even at massive scale. This is fundamentally a different problem than row-based querying.

### Why cosine similarity over euclidean distance?

For text embeddings, **cosine similarity** measures the angle between two vectors rather than the absolute distance. This makes it robust to differences in text length — a short sentence and a long paragraph about the same topic will have similar cosine similarity even though their vector magnitudes differ significantly.

### Why FastAPI over Flask or Django?

FastAPI is the fastest Python web framework, built on Starlette with async support. It automatically generates OpenAPI/Swagger documentation, has built-in request validation via Pydantic, and its async architecture handles concurrent requests efficiently — critical for an AI application where embedding generation can be slow.

---

##  Performance

| Metric | Value |
|---|---|
| Search latency (p50) | ~500ms |
| Search latency (p95) | ~1200ms |
| Document indexing time | ~2-3 seconds per document |
| Vector dimensions | 384 |
| Similarity metric | Cosine |
| Max file size | 10MB |
| Supported formats | PDF, DOCX, TXT |

---

##  Future Improvements

- [ ] **Hybrid Search** — Combine BM25 keyword search with semantic search for better precision on exact matches
- [ ] **Re-ranking Layer** — Add a cross-encoder model to re-rank top results for improved accuracy
- [ ] **URL Crawler** — Auto-fetch and index any webpage from a URL
- [ ] **User Authentication** — Google OAuth for user-specific document collections
- [ ] **Kafka Pipeline** — Async document ingestion queue for high-volume indexing
- [ ] **Analytics Dashboard** — Search query analytics and popular document insights

---

##  Author

**Shiwani Verma**  
Computer Science Graduate  
[GitHub](https://github.com/shiwaniverma2060) · [LinkedIn](https://linkedin.com/in/shiwaniverma)

---

## 📄 License

MIT License — feel free to use this project as a reference or starting point.

---

<div align="center">

** If this project impressed you, give it a star on GitHub!**

Built with  using FastAPI · Pinecone · sentence-transformers · React · TypeScript

