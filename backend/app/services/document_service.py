import io
from datetime import datetime
from typing import List, Optional
from fastapi import UploadFile, HTTPException
from pypdf import PdfReader

from app.models.document import DocumentMetadata
from app.rag.ingest import process_and_index_document

# In-Memory Metadata Store (For Vercel demo purposes)
# In a real app, use Supabase/Postgres.
# This will reset on every server restart (Vercel cold boot).
_memory_metadata_store = []

class DocumentService:
    def list_documents(self) -> List[DocumentMetadata]:
        return _memory_metadata_store

    async def upload_document(self, file: UploadFile) -> DocumentMetadata:
        # 1. Validation
        if not file.filename.endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

        try:
            # 2. Read File to Memory
            content = await file.read()
            pdf_file = io.BytesIO(content)
            
            # 3. Extract Text (Basic Extraction)
            reader = PdfReader(pdf_file)
            text_content = ""
            for page in reader.pages:
                text_content += page.extract_text() + "\n"

            # 4. Ingest to Pinecone
            chunk_count = process_and_index_document(text_content, file.filename)

            # 5. Metadata Registration (In-Memory)
            doc_meta = DocumentMetadata(
                id=f"doc_{int(datetime.now().timestamp())}",
                filename=file.filename,
                upload_timestamp=datetime.now(),
                status="indexed",
                page_count=len(reader.pages)
            )
            _memory_metadata_store.append(doc_meta)

            return doc_meta

        except Exception as e:
            import traceback
            tb = traceback.format_exc()
            print(f"Ingestion Error: {tb}")
            raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)} | Trace: {tb[-200:]}")

document_service = DocumentService()
