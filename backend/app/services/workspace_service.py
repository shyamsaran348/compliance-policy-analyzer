import json
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Optional
from fastapi import HTTPException

from langchain_community.vectorstores import Chroma
from app.rag.embeddings import get_embedding_model
from app.models.workspace import Workspace, CreateWorkspaceRequest
from app.services.document_service import document_service

# Constants
BASE_DIR = Path(__file__).resolve().parents[3]
METADATA_FILE = BASE_DIR / "storage" / "workspaces.json"
CHROMA_DIR = str(BASE_DIR / "storage" / "chroma")
STAGING_COLLECTION_NAME = "staging_docs"

class WorkspaceService:
    def __init__(self):
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

    def get_workspace(self, workspace_id: str) -> Optional[Workspace]:
        data = self._load_metadata()
        for item in data:
            if item["id"] == workspace_id:
                return Workspace(**item)
        return None

    def list_workspaces(self) -> List[Workspace]:
        data = self._load_metadata()
        return [Workspace(**item) for item in data]

    def create_workspace(self, request: CreateWorkspaceRequest) -> Workspace:
        # 1. Validate Documents
        all_docs = document_service.list_documents()
        valid_doc_map = {d.id: d.filename for d in all_docs}
        
        target_filenames = []
        for doc_id in request.document_ids:
            if doc_id not in valid_doc_map:
                raise HTTPException(status_code=404, detail=f"Document ID {doc_id} not found.")
            target_filenames.append(valid_doc_map[doc_id])

        # 2. Setup Vector DB Access
        embedding_model = get_embedding_model()
        
        # Staging (Source)
        staging_db = Chroma(
            client_settings=None, # uses default local settings if persisted
            collection_name=STAGING_COLLECTION_NAME,
            embedding_function=embedding_model.embedder,
            persist_directory=CHROMA_DIR
        )

        # 3. Create New Workspace Collection
        workspace_id = f"ws_{str(uuid.uuid4())[:8]}"
        collection_name = f"workspace_{workspace_id}"
        
        workspace_db = Chroma(
            collection_name=collection_name,
            embedding_function=embedding_model.embedder,
            persist_directory=CHROMA_DIR
        )

        # 4. Clone Vectors (The "Clean Room" Strategy)
        total_chunks_copied = 0
        
        for filename in target_filenames:
            # Query Staging
            # We filter by 'doc_name' which was set in ingest.py as the filename
            results = staging_db.get(
                where={"doc_name": filename},
                include=["embeddings", "metadatas", "documents"]
            )
            
            if not results["ids"]:
                print(f"Warning: No chunks found for {filename} in staging.")
                continue

            # Add to Workspace
            workspace_db.add_texts(
                texts=results["documents"],
                metadatas=results["metadatas"],
                ids=results["ids"],
                embeddings=results["embeddings"]
            )
            total_chunks_copied += len(results["ids"])

        workspace_db.persist()

        # 5. Persist Workspace Metadata
        new_workspace = Workspace(
            id=workspace_id,
            name=request.name,
            document_ids=request.document_ids,
            created_at=datetime.now()
        )

        current_meta = self._load_metadata()
        current_meta.append(new_workspace.model_dump())
        self._save_metadata(current_meta)

        return new_workspace

workspace_service = WorkspaceService()
