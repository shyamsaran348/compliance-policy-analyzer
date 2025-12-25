from fastapi import APIRouter, UploadFile, File, Depends
from typing import List
from app.models.document import DocumentMetadata
from app.services.document_service import document_service
from app.core.security import verify_api_key

router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
    dependencies=[Depends(verify_api_key)]
)

@router.post("/upload", response_model=DocumentMetadata)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a PDF document.
    - Validates file type
    - Saves to disk
    - Ingests into STAGING vector store
    - Returns document metadata
    """
    return await document_service.upload_document(file)

@router.get("/", response_model=List[DocumentMetadata])
def list_documents():
    """
    List all available documents in the system.
    """
    return document_service.list_documents()
