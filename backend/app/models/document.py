from pydantic import BaseModel
from datetime import datetime
from typing import Literal

class DocumentMetadata(BaseModel):
    id: str
    filename: str
    upload_timestamp: datetime = datetime.now()
    status: Literal["processing", "available", "error"] = "processing"
    page_count: int = 0
