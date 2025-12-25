from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.chat import router as chat_router

app = FastAPI(
    title="Compliance & Policy Analyzer API",
    version="1.0.0"
)

# CORS Configuration
# Relaxing CORS to allow all origins for debugging
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
