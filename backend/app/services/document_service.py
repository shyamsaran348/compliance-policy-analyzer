import shutil
import os
import json
from pathlib import Path
from datetime import datetime
from typing import List, Optional
from fastapi import UploadFile, HTTPException

from app.models.document import DocumentMetadata
from app.rag.ingest import load_pdf_pages, normalize_pages, chunk_pages, validate_chunks, index_chunks

# Constants
BASE_DIR = Path(__file__).resolve().parents[3]
STORAGE_DIR = BASE_DIR / "storage" / "documents"
METADATA_FILE = BASE_DIR / "storage" / "metadata.json"
CHROMA_DIR = BASE_DIR / "storage" / "chroma"
STAGING_COLLECTION = "staging_docs"

class DocumentService:
    def __init__(self):
        os.makedirs(STORAGE_DIR, exist_ok=True)
        if not METADATA_FILE.exists():
            with open(METADATA_FILE, "w") as f:
                json.dump([], f)

    def _load_metadata(self) -> List[dict]:
        with open(METADATA_FILE, "r") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []

    def _save_metadata(self, metadata_list: List[dict]):
        with open(METADATA_FILE, "w") as f:
            json.dump(metadata_list, f, indent=2, default=str)

    def list_documents(self) -> List[DocumentMetadata]:
        data = self._load_metadata()
        return [DocumentMetadata(**item) for item in data]

    def get_document(self, doc_id: str) -> Optional[DocumentMetadata]:
        docs = self.list_documents()
        for doc in docs:
            if doc.id == doc_id:
                return doc
        return None

    async def upload_document(self, file: UploadFile) -> DocumentMetadata:
        # 1. Validation
        if not file.filename.endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

        # 2. ID Generation & Path
        doc_id = f"doc_{int(datetime.now().timestamp())}_{file.filename.replace(' ', '_')}"
        file_path = STORAGE_DIR / f"{doc_id}.pdf"

        # 3. Save to Disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 4. Ingestion Pipeline
        try:
            # Load & Normalize
            raw_pages = load_pdf_pages(str(file_path))
            pages = normalize_pages(raw_pages, file.filename)
            
            # Chunking
            chunks = chunk_pages(pages)
            validate_chunks(chunks)

            # Indexing to STAGING Collection
            # IMPORTANT: We use a specific staging collection, NOT the active chat one.
            index_chunks(
                chunks, 
                collection_name=STAGING_COLLECTION,
                persist_dir=str(CHROMA_DIR)
            )

            # 5. Metadata Registration
            doc_meta = DocumentMetadata(
                id=doc_id,
                filename=file.filename,
                upload_timestamp=datetime.now(),
                status="available",
                page_count=len(pages)
            )

            current_meta = self._load_metadata()
            current_meta.append(doc_meta.model_dump())
            self._save_metadata(current_meta)

            return doc_meta

        except Exception as e:
            # Cleanup on failure
            if file_path.exists():
                os.remove(file_path)
            raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")

document_service = DocumentService()
