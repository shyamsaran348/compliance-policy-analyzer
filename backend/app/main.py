from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Serverless Hack: Ensure HOME and specialized dirs point to /tmp
# This prevents libraries like huggingface_hub or matplotlib from crashing
# when trying to create config files in read-only /var/task or /home/sbx keys.
os.environ["HF_HOME"] = "/tmp/hf"
os.environ["MPLCONFIGDIR"] = "/tmp/matplotlib"
os.environ["TRANSFORMERS_CACHE"] = "/tmp/transformers"

from app.api.chat import router as chat_router
from app.api.documents import router as documents_router
from app.api.workspaces import router as workspaces_router

# NOTE: Removed auto-creation of Pinecone Index.
# Vercel Serverless Functions have a 10s timeout, and index creation takes 60s+.
# Users must create the index manually in the Pinecone Console.

app = FastAPI(
    title="Compliance & Policy Analyzer API",
    version="1.0.0"
)

# CORS Configuration
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*", "x-api-key"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Register API routes
app.include_router(chat_router)
app.include_router(documents_router, prefix="/api/v1")
app.include_router(workspaces_router, prefix="/api/v1")
