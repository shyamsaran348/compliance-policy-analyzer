from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Workspace(BaseModel):
    id: str
    name: str
    document_ids: List[str]
    created_at: datetime = datetime.now()

class CreateWorkspaceRequest(BaseModel):
    name: str
    document_ids: List[str]

class WorkspaceResponse(BaseModel):
    id: str
    name: str
    document_ids: List[str]
    created_at: datetime
