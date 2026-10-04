import time
import hashlib
from pathlib import Path

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct
)

import sys
sys.path.append(str(Path(__file__).resolve().parent.parent))

from config import (
    DECORATED_VENUES_DIR,
    VECTOR_SIZE,
    COLLECTION_NAME,
    QDRANT_URL,
    QDRANT_TIMEOUT
)

from backend.embedder import embed_image, init_model

def get_deterministic_id(relative_path: str) -> str:
    # Qdrant UUIDs require standard UUID format (32 hex chars with hyphens)
    # So we hash the path and format it as UUID
    h = hashlib.sha256(relative_path.encode('utf-8')).hexdigest()
    # Format: 8-4-4-4-12
    return f"{h[:8]}-{h[8:12]}-{h[12:16]}-{h[16:20]}-{h[20:32]}"

def main():
    print("Connecting to Qdrant...")
    client = QdrantClient(
        url=QDRANT_URL,
        timeout=QDRANT_TIMEOUT
    )
    print("Connected.")

    if client.collection_exists(COLLECTION_NAME):
        print("Deleting old collection...")
        client.delete_collection(collection_name=COLLECTION_NAME)

    print("Creating collection...")
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(
            size=VECTOR_SIZE,
            distance=Distance.COSINE
        )
    )
    print("Collection created.")

    print("Initializing model...")
    init_model()

    image_extensions = {".jpg", ".jpeg", ".png", ".webp"}
    images = []
    
    # Recursively find all images
    for p in DECORATED_VENUES_DIR.rglob("*"):
        if p.is_file() and p.suffix.lower() in image_extensions:
            images.append(p)

    print(f"Found {len(images)} images.")

    for index, image_path in enumerate(images, start=1):
        try:
            start = time.perf_counter()

            # Event type is the parent directory name
            event_type = image_path.parent.name
            
            # Use relative_to for cleaner paths in metadata
            relative_path = str(image_path.relative_to(DECORATED_VENUES_DIR)).replace("\\", "/")

            vector, inference_time = embed_image(image_path)

            point_id = get_deterministic_id(relative_path)

            point = PointStruct(
                id=point_id,
                vector=vector,
                payload={
                    "event_type": event_type,
                    "image_name": image_path.name,
                    "image_path": str(image_path),
                    "relative_path": relative_path,
                    "image_url": f"/catalog/{relative_path}"
                }
            )

            qdrant_start = time.perf_counter()
            client.upsert(
                collection_name=COLLECTION_NAME,
                points=[point],
                wait=True
            )
            qdrant_time = time.perf_counter() - qdrant_start

            total_time = time.perf_counter() - start

            print(f"[{index}/{len(images)}]")
            print(f"Image: {image_path.name}")
            print(f"Event: {event_type}")
            print(f"Embedding: {inference_time:.2f}s")
            print(f"Qdrant: {qdrant_time:.3f}s")
            print(f"Total: {total_time:.2f}s\n")

        except Exception as e:
            print(f"ERROR processing {image_path.name}: {e}")

    print("================================")
    print("INDEXING COMPLETE")
    print("================================")

if __name__ == "__main__":
    main()
