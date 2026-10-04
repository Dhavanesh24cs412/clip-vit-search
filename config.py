from pathlib import Path

# -----------------------------
# Paths
# -----------------------------

BASE_DIR = Path(__file__).resolve().parent
DECORATED_VENUES_DIR = BASE_DIR / "decorated-venues"

# -----------------------------
# CLIP Model Config
# -----------------------------

MODEL_NAME = "openai/clip-vit-base-patch32"
VECTOR_SIZE = 512
DEVICE = "cpu"

# -----------------------------
# Qdrant & Search
# -----------------------------

QDRANT_URL = "http://127.0.0.1:6333"
COLLECTION_NAME = "visual_search_index"
QDRANT_TIMEOUT = 60
TOP_K = 5