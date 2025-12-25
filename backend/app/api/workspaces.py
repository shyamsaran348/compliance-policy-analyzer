from fastapi import APIRouter, Depends
from typing import List

from app.models.workspace import Workspace, CreateWorkspaceRequest
from app.services.workspace_service import workspace_service
from app.core.security import verify_api_key

router = APIRouter(
    prefix="/workspaces",
    tags=["Workspaces"],
    dependencies=[Depends(verify_api_key)]
)

@router.post("/", response_model=Workspace)
def create_workspace(request: CreateWorkspaceRequest):
    """
    Create a new isolated retrieval workspace.
    - Validates document IDs
    - Creates a new Chroma collection
    - Copies relevant vectors from Staging
    - Returns workspace details
    """
    return workspace_service.create_workspace(request)

@router.get("/", response_model=List[Workspace])
def list_workspaces():
    """
    List all created workspaces.
    """
    return workspace_service.list_workspaces()
