from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Serverless Hack: Ensure HOME and specialized dirs point to /tmp
# This prevents libraries like huggingface_hub or matplotlib from crashing
os.environ["HF_HOME"] = "/tmp/hf"
os.environ["MPLCONFIGDIR"] = "/tmp/matplotlib"
os.environ["TRANSFORMERS_CACHE"] = "/tmp/transformers"
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# MONKEYPATCH: Fix for "OSError: [Errno 38] Function not implemented" or Errno 2 on Vercel
# Vercel/AWS Lambda doesn't support multiprocessing.SemLock (no /dev/shm).
# We mock it to allow libraries to import without crashing, assuming single-threaded execution.
import multiprocessing.synchronize
def _sem_lock_patch(*args, **kwargs):
    # Return a dummy context manager that does nothing
    class DummyLock:
        def __enter__(self): return self
        def __exit__(self, *args): pass
        def acquire(self, *args, **kwargs): return True
        def release(self, *args, **kwargs): pass
    return DummyLock()

multiprocessing.synchronize.SemLock = _sem_lock_patch
# End Monkeypatch

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
