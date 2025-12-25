# backend/app/models/schemas.py

from pydantic import BaseModel, Field
from typing import List


class ChatRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=3,
        description="User question about the policy document"
    )


class Citation(BaseModel):
    doc_name: str
    page_number: int
    snippet: str


class ChatResponse(BaseModel):
    answer: str
    citations: List[Citation]


class ErrorResponse(BaseModel):
    detail: str
