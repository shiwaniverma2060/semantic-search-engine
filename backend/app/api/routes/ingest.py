from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.pinecone_service import upsert_document

router = APIRouter()

class IngestRequest(BaseModel):
    title: str
    text: str
    source: str = ""

class IngestResponse(BaseModel):
    id: str
    message: str

@router.post("/ingest", response_model=IngestResponse)
def ingest(request: IngestRequest):
    """Add a document to the search index"""
    if not request.text.strip():
        raise HTTPException(
            status_code=400,
            detail="Text cannot be empty"
        )
    try:
        doc_id = upsert_document(
            text=request.text,
            metadata={
                "title": request.title,
                "source": request.source,
            }
        )
        return {
            "id": doc_id,
            "message": f"Document '{request.title}' indexed successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ingestion failed: {str(e)}"
        )
from fastapi import UploadFile, File, Form
import io

@router.post("/ingest-file")
async def ingest_file(
    file: UploadFile = File(...),
    title: str = Form(""),
    source: str = Form("")
):
    """Upload and index a PDF, DOCX, or TXT file"""
    filename = file.filename or ""
    content = await file.read()
    text = ""

    try:
        if filename.endswith(".txt"):
            text = content.decode("utf-8")

        elif filename.endswith(".pdf"):
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(content))
            text = " ".join(page.extract_text() or "" for page in reader.pages)

        elif filename.endswith(".docx"):
            import docx
            doc = docx.Document(io.BytesIO(content))
            text = " ".join(p.text for p in doc.paragraphs if p.text.strip())

        else:
            raise HTTPException(status_code=400, detail="Unsupported file type. Use PDF, DOCX, or TXT")

        text = " ".join(text.split())[:5000]

        if len(text) < 50:
            raise HTTPException(status_code=400, detail="Could not extract text from file")

        doc_title = title or filename.replace(".pdf","").replace(".docx","").replace(".txt","")

        doc_id = upsert_document(
            text=text,
            metadata={"title": doc_title, "source": source or filename}
        )

        return {
            "id": doc_id,
            "title": doc_title,
            "message": f"File indexed successfully",
            "chars_indexed": len(text)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")
        