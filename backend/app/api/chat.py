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
        return rag_service.run(request.question)
    except Exception:
        # Never leak internal details
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
