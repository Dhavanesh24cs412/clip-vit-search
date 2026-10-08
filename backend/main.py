import sys
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Ensure we can import from backend and config
sys.path.append(str(Path(__file__).resolve().parent.parent))

from config import DECORATED_VENUES_DIR
from backend.api import router, qdrant_client
from backend.embedder import init_model
from config import COLLECTION_NAME, VECTOR_SIZE

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application starting up...")
    
    # 1. Check Qdrant and Collection
    try:
        collection_info = qdrant_client.get_collection(collection_name=COLLECTION_NAME)
        if collection_info.config.params.vectors.size != VECTOR_SIZE:
            print(f"WARNING: Qdrant collection has incompatible vector dimension ({collection_info.config.params.vectors.size}). Expected {VECTOR_SIZE}.")
            print("Run the indexing command.")
        else:
            print(f"Collection '{COLLECTION_NAME}' detected with size {VECTOR_SIZE}.")
            
            # Print number of indexed vectors if available
            points_count = collection_info.points_count
            print(f"Indexed vectors: {points_count}")
            
    except Exception as e:
        print(f"WARNING: Qdrant collection '{COLLECTION_NAME}' is missing or Qdrant is unreachable.")
        print(f"Error: {e}")
        print("Run the indexing command.")
        
    # 2. Load CLIP Model
    print("Initializing CLIP model...")
    init_model()
    print("Application startup complete.")
    
    yield
    
    print("Application shutting down...")

app = FastAPI(
    title="DVMS API",
    description="Dense Visual Metric Search Prototype",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router)

# Mount static files safely
if DECORATED_VENUES_DIR.exists():
    app.mount(
        "/catalog", 
        StaticFiles(directory=str(DECORATED_VENUES_DIR)), 
        name="catalog"
    )
else:
    print(f"WARNING: Directory {DECORATED_VENUES_DIR} does not exist. Static images won't be served.")
