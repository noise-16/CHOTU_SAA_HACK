import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .database import engine, Base, SessionLocal
from .seed_data import seed_database_if_empty
from .routers import system, patients, rooms


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed if empty
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database_if_empty(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="ClearQueue — CareWell Hospital OPD API",
    description="FastAPI + SQLite backend for real-time OPD smart prioritization, room allocation, and clinical triage persistence.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for all origins and localhost development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(system.router)
app.include_router(patients.router)
app.include_router(rooms.router)

# Resolve project root directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(BASE_DIR, "src")
INDEX_PATH = os.path.join(BASE_DIR, "index.html")

# Mount src static files for direct web access via FastAPI server
if os.path.exists(SRC_DIR):
    app.mount("/src", StaticFiles(directory=SRC_DIR), name="src")


@app.get("/")
def serve_index():
    """Serve the main CareWell Hospital web portal."""
    if os.path.exists(INDEX_PATH):
        return FileResponse(INDEX_PATH, media_type="text/html")
    return {"message": "ClearQueue API is running. index.html not found."}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
