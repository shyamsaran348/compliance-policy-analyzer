import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException

from app.models.workspace import Workspace, CreateWorkspaceRequest
from app.services.document_service import document_service

# In-Memory Store
_memory_workspace_store = []

class WorkspaceService:
    def get_workspace(self, workspace_id: str) -> Optional[Workspace]:
        for item in _memory_workspace_store:
            if item.id == workspace_id:
                return item
        return None

    def list_workspaces(self) -> List[Workspace]:
        return _memory_workspace_store

    def create_workspace(self, request: CreateWorkspaceRequest) -> Workspace:
        # 1. Validate Documents
        all_docs = document_service.list_documents()
        valid_doc_map = {d.id: d.filename for d in all_docs}
        
        target_filenames = []
        for doc_id in request.document_ids:
            if doc_id not in valid_doc_map:
                raise HTTPException(status_code=404, detail=f"Document ID {doc_id} not found.")
            target_filenames.append(valid_doc_map[doc_id])

        # 2. logical grouping (No physical cloning needed for Pinecone)
        workspace_id = f"ws_{str(uuid.uuid4())[:8]}"
        
        # 3. Create Workspace
        new_workspace = Workspace(
            id=workspace_id,
            name=request.name,
            document_ids=request.document_ids,
            created_at=datetime.now()
        )

        _memory_workspace_store.append(new_workspace)
        return new_workspace

    def get_workspace_filenames(self, workspace_id: str) -> List[str]:
        """
        Helper to get the actual filenames for a workspace
        to build the vector filter.
        """
        workspace = self.get_workspace(workspace_id)
        if not workspace:
            return []
        
        all_docs = document_service.list_documents()
        valid_doc_map = {d.id: d.filename for d in all_docs}
        
        filenames = []
        for doc_id in workspace.document_ids:
             if doc_id in valid_doc_map:
                 filenames.append(valid_doc_map[doc_id])
                 
        return filenames

workspace_service = WorkspaceService()
