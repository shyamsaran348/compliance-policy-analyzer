from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import verify_api_key
from app.core.rate_limiter import rate_limiter
from app.models.schemas import ChatRequest, ChatResponse
from app.services.rag_service import RAGService

router = APIRouter(prefix="/api/v1", tags=["chat"])

rag_service = RAGService()


@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK
)
@rate_limiter
def chat(
    request: ChatRequest,
    api_key: str = Depends(verify_api_key)
):
    try:
        return rag_service.run(request.question, request.workspace_id)
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        print(f"Chat Error: {tb}")
        # Expose error for debugging purposes in this phase
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat failed: {str(e)} | Trace: {tb[-200:]}"
        )
