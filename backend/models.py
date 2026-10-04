from pydantic import BaseModel
from typing import List

class SearchResult(BaseModel):
    rank: int
    score: float
    image_name: str
    event_type: str
    image_url: str

class TimingInfo(BaseModel):
    embedding_seconds: float
    search_seconds: float

class QueryInfo(BaseModel):
    filename: str

class SearchResponse(BaseModel):
    event_type: str
    query: QueryInfo
    results: List[SearchResult]
    timing: TimingInfo

class TextSearchRequest(BaseModel):
    event_type: str
    prompt: str

class EventItem(BaseModel):
    id: str
    label: str

class EventsResponse(BaseModel):
    events: List[EventItem]

class HealthResponse(BaseModel):
    status: str
    qdrant: bool
    model_loaded: bool
    collection: str
