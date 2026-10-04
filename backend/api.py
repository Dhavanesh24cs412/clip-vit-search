import time
import io
import os
from PIL import Image, UnidentifiedImageError
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from qdrant_client import QdrantClient
from qdrant_client.http.models import Filter, FieldCondition, MatchValue

from backend.embedder import embed_image, embed_text, _model
from backend.models import (
    SearchResponse, SearchResult, TimingInfo, QueryInfo,
    EventsResponse, EventItem, HealthResponse, TextSearchRequest
)
from config import (
    QDRANT_URL, QDRANT_TIMEOUT, COLLECTION_NAME, 
    DECORATED_VENUES_DIR, TOP_K, VECTOR_SIZE
)

router = APIRouter()
qdrant_client = QdrantClient(url=QDRANT_URL, timeout=QDRANT_TIMEOUT)

EVENT_LABELS = {
    "birthday": "Birthday",
    "corporate": "Corporate Event",
    "entertainment": "Entertainment",
    "haldi": "Haldi",
    "interactiveFoodStalls": "Interactive Food Stalls",
    "sangeet-mehndi": "Sangeet / Mehndi",
    "wedding-reception-engagement": "Wedding / Reception / Engagement"
}

@router.get("/health", response_model=HealthResponse)
def health_check():
    qdrant_ok = False
    try:
        qdrant_client.get_collections()
        qdrant_ok = True
    except Exception:
        pass
        
    return HealthResponse(
        status="ok",
        qdrant=qdrant_ok,
        model_loaded=_model is not None,
        collection=COLLECTION_NAME
    )

@router.get("/events", response_model=EventsResponse)
def get_events():
    events = []
    if DECORATED_VENUES_DIR.exists():
        for item in DECORATED_VENUES_DIR.iterdir():
            if item.is_dir():
                label = EVENT_LABELS.get(item.name, item.name)
                events.append(EventItem(id=item.name, label=label))
    # Sort events alphabetically by label
    events.sort(key=lambda x: x.label)
    return EventsResponse(events=events)

@router.post("/search", response_model=SearchResponse)
async def search(
    event_type: str = Form(...),
    image: UploadFile = File(...)
):
    if not image.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
        
    # Read image content safely in memory
    try:
        content = await image.read()
        pil_image = Image.open(io.BytesIO(content)).convert("RGB")
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Invalid image file format")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading image: {e}")

    # Generate embedding
    try:
        vector, embed_time = embed_image(pil_image)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding error: {e}")
        
    # Search Qdrant
    search_start = time.perf_counter()
    try:
        response = qdrant_client.query_points(
            collection_name=COLLECTION_NAME,
            query=vector,
            limit=TOP_K,
            with_payload=True,
            query_filter=Filter(
                must=[
                    FieldCondition(
                        key="event_type",
                        match=MatchValue(value=event_type)
                    )
                ]
            )
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Qdrant search error: {e}")
        
    search_time = time.perf_counter() - search_start

    print(f"SEARCH")
    print(f"Event: {event_type}")
    print(f"Embedding: {embed_time:.2f}s")
    print(f"Qdrant: {search_time:.3f}s")
    print(f"Results: {len(response.points)}\n")
    
    results = []
    for rank, point in enumerate(response.points, start=1):
        payload = point.payload or {}
        results.append(SearchResult(
            rank=rank,
            score=point.score,
            image_name=payload.get("image_name", ""),
            event_type=payload.get("event_type", ""),
            image_url=payload.get("image_url", "")
        ))
        
    return SearchResponse(
        event_type=event_type,
        query=QueryInfo(filename=image.filename),
        results=results,
        timing=TimingInfo(
            embedding_seconds=round(embed_time, 3),
            search_seconds=round(search_time, 3)
        )
    )

@router.post("/search/text", response_model=SearchResponse)
def search_text(request: TextSearchRequest):
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
        
    try:
        vector, embed_time = embed_text(request.prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text embedding error: {e}")
        
    search_start = time.perf_counter()
    try:
        response = qdrant_client.query_points(
            collection_name=COLLECTION_NAME,
            query=vector,
            limit=TOP_K,
            with_payload=True,
            query_filter=Filter(
                must=[
                    FieldCondition(
                        key="event_type",
                        match=MatchValue(value=request.event_type)
                    )
                ]
            )
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Qdrant search error: {e}")
        
    search_time = time.perf_counter() - search_start

    print(f"TEXT SEARCH")
    print(f"Event: {request.event_type}")
    print(f"Prompt: '{request.prompt}'")
    print(f"Embedding: {embed_time:.2f}s")
    print(f"Qdrant: {search_time:.3f}s")
    print(f"Results: {len(response.points)}\n")
    
    results = []
    for rank, point in enumerate(response.points, start=1):
        payload = point.payload or {}
        results.append(SearchResult(
            rank=rank,
            score=point.score,
            image_name=payload.get("image_name", ""),
            event_type=payload.get("event_type", ""),
            image_url=payload.get("image_url", "")
        ))
        
    return SearchResponse(
        event_type=request.event_type,
        query=QueryInfo(filename=request.prompt),
        results=results,
        timing=TimingInfo(
            embedding_seconds=round(embed_time, 3),
            search_seconds=round(search_time, 3)
        )
    )
