import time
import torch
from PIL import Image
from transformers import CLIPProcessor, CLIPModel

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from config import MODEL_NAME, DEVICE

_model = None
_processor = None

def init_model():
    global _model, _processor
    if _model is not None:
        return

    print(f"Loading CLIP model: {MODEL_NAME}")
    load_start = time.perf_counter()

    _model = CLIPModel.from_pretrained(MODEL_NAME).to(DEVICE)
    _processor = CLIPProcessor.from_pretrained(MODEL_NAME)
    
    _model.eval()
    
    # Prevent unnecessary CPU thread explosion
    torch.set_num_threads(2)

    load_time = time.perf_counter() - load_start
    print(f"Model loaded in {load_time:.2f} seconds")

def embed_image(image_or_path):
    """
    Convert image -> normalized CLIP embedding.
    """
    if _model is None:
        init_model()

    if isinstance(image_or_path, (str, Path)):
        image = Image.open(image_or_path).convert("RGB")
    else:
        image = image_or_path.convert("RGB")

    start = time.perf_counter()

    inputs = _processor(images=image, return_tensors="pt").to(DEVICE)

    with torch.inference_mode():
        outputs = _model.get_image_features(**inputs)
        
        if hasattr(outputs, "pooler_output"):
            embedding = outputs.pooler_output
        elif hasattr(outputs, "image_embeds"):
            embedding = outputs.image_embeds
        else:
            embedding = outputs
            
        if not isinstance(embedding, torch.Tensor):
            embedding = embedding[0]
            
        embedding = embedding / embedding.norm(p=2, dim=-1, keepdim=True)

    elapsed = time.perf_counter() - start

    embedding = embedding.squeeze(0).cpu().numpy().tolist()

    return embedding, elapsed

def embed_text(text: str):
    """
    Convert text -> normalized CLIP embedding.
    """
    if _model is None:
        init_model()

    start = time.perf_counter()

    # The tokenizer requires truncation/padding if text is too long
    inputs = _processor(text=[text], return_tensors="pt", padding=True, truncation=True).to(DEVICE)

    with torch.inference_mode():
        outputs = _model.get_text_features(**inputs)
        
        if hasattr(outputs, "pooler_output"):
            embedding = outputs.pooler_output
        elif hasattr(outputs, "text_embeds"):
            embedding = outputs.text_embeds
        else:
            embedding = outputs
            
        if not isinstance(embedding, torch.Tensor):
            embedding = embedding[0]
            
        embedding = embedding / embedding.norm(p=2, dim=-1, keepdim=True)

    elapsed = time.perf_counter() - start

    embedding = embedding.squeeze(0).cpu().numpy().tolist()

    return embedding, elapsed
