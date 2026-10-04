# DVMS Architecture Evolution: Moving from Vision-Only to Multi-Modal

This document serves as both a technical reading resource and a strategic blueprint for migrating the Dense Visual Metric Search (DVMS) platform from a pure image-to-image search to a multimodal (text-to-image) search.

---

## 1. Current Architecture: Image-to-Image (DINOv2)

The current DVMS prototype relies entirely on **DINOv2**, a state-of-the-art pure vision foundation model developed by Meta. 

### Component Breakdown
- **Embedding Model:** `dinov2_vits14` (Vision Transformer, Small, patch size 14)
- **Vector Dimensionality:** 384 dimensions
- **Database:** Qdrant Vector Database
- **Distance Metric:** Cosine Similarity

### Current Data Flow
1. **Offline Indexing:** Catalog images are passed through DINOv2. The model analyzes the pixels (shapes, textures, lighting) and outputs a 384D mathematical vector. This vector is stored in Qdrant alongside metadata (event type, file path).
2. **Search Query:** A user uploads a *Reference Image*.
3. **Inference:** The Reference Image is passed through DINOv2 to generate its 384D vector.
4. **Retrieval:** Qdrant compares the Query Vector against the Catalog Vectors using Cosine Similarity, returning the closest matches.

### Limitations (The "Text" Problem)
DINOv2 is exceptionally good at understanding visual structures, but it has **no semantic understanding of human language**. If a user types "pink glowing lights," DINOv2 cannot process this string. Because the Qdrant database is filled with DINOv2 vision vectors, there is no way to query it using text.

---

## 2. Target Architecture: Multi-Modal (CLIP)

To allow users to type a description (e.g., "I need a pink themed glowing lights venue") and retrieve relevant images, the system must shift to a **Multi-Modal Architecture**. 

The industry standard for this is **CLIP** (Contrastive Language-Image Pre-Training), developed by OpenAI.

### What is CLIP?
CLIP is unique because it was trained on millions of `(Image, Text Caption)` pairs. It contains two separate neural networks (encoders):
1. **A Vision Encoder:** Processes images.
2. **A Text Encoder:** Processes text strings.

Crucially, CLIP is trained to map both text and images into the **exact same latent vector space**. This means the text vector for the word "pink" will mathematically align with the image vector of a pink picture.

### New Data Flow
With CLIP, the architecture becomes highly flexible, supporting both Text-to-Image and Image-to-Image search.

1. **Offline Indexing:** Catalog images are passed through the **CLIP Vision Encoder**. The resulting vectors (typically 512D or 768D) are stored in Qdrant.
2. **Search Query (Text):** The user types a prompt.
3. **Inference:** The prompt is passed through the **CLIP Text Encoder** to generate a query vector.
4. **Retrieval:** Qdrant compares the Text Query Vector against the Image Catalog Vectors.

---

## 3. Technical Migration Plan

Migrating DVMS to a CLIP architecture requires coordinated changes across the entire stack. Below is the blueprint for execution.

### Phase 1: Machine Learning Core (`backend/embedder.py`)
- **Dependency Update:** Replace the `torch.hub.load('facebookresearch/dinov2')` implementation with the Hugging Face `transformers` library.
- **Model Selection:** Select a lightweight but capable CLIP variant (e.g., `openai/clip-vit-base-patch32` or the newer Google `SigLIP` models for better performance).
- **Function Refactoring:**
  - Modify `embed_image(image_path)` to use the CLIP Image Processor.
  - Create a new `embed_text(prompt)` function that uses the CLIP Tokenizer and Text Model.

### Phase 2: Vector Database Migration (`backend/indexing.py`)
- **Dimensionality Shift:** CLIP vectors have different dimensions than DINOv2. A `ViT-B/32` CLIP model uses 512 dimensions.
- **Database Reset:** The current Qdrant collection (`visual_search_index` at 384D) must be dropped and recreated with `size=512`.
- **Re-indexing:** The `indexing.py` script must be re-run on the entire `decorated-venues/` directory so that all images are re-embedded using the CLIP Vision Encoder.

### Phase 3: Backend API (`backend/main.py`)
- **Extend the Router:** Retain the existing `POST /search` endpoint to continue supporting Image-to-Image searches (now powered by CLIP).
- **New Endpoint:** Create `POST /search/text`.
  - **Payload:** Accepts JSON containing `{ "event_type": "wedding", "prompt": "pink glowing lights" }`.
  - **Logic:** Calls `embed_text()`, constructs a Qdrant search request (with the `event_type` payload filter), and returns the results.

### Phase 4: Frontend UI (`frontend/src/`)
- **State Management:** Introduce a toggle or tab system in `App.jsx` to switch the UI between "Search by Reference Image" and "Search by Text Prompt".
- **Component Creation:** Create a `TextInputPrompt.jsx` component featuring a modern input field.
- **API Integration:** Update `api.js` to route text queries to the new `POST /search/text` backend endpoint.

---

## Summary

By replacing DINOv2 with CLIP, DVMS evolves from a strict visual matching tool into a semantic search engine. The underlying database technology (Qdrant) and application framework (FastAPI/React) remain robust and fully capable of supporting this shift; the primary work lies in swapping the embedding models and re-indexing the catalog data.
