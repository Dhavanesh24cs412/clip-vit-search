# DVMS: Multi-Modal CLIP Search

DVMS(Dense Visual Metric Search) is a complete local visual and textual similarity search application. It enables finding visually similar images from a catalog by analyzing visual features, or by using natural language descriptions (e.g. "pink themed glowing lights venue"). This is achieved by utilizing OpenAI's CLIP model, which uniquely bridges the gap between text and images in a unified mathematical space.

## What is CLIP and How Does it Work?

CLIP (Contrastive Language-Image Pretraining) is a deep learning model developed by OpenAI that understands both images and text. 

Unlike traditional models that only look at pixels, CLIP was trained on millions of image-text pairs. It learns to map both images and text into the **exact same 512-dimensional vector space**. 

Here's how it enables our search:
1. **Indexing (Offline):** When you run the indexing script, the model converts every venue image in your catalog into a 512-dimensional math vector and saves it into the Qdrant database.
2. **Text Search (Online):** When you type "pink themed glowing lights", the exact same model converts your text into a 512-dimensional vector. Because CLIP was trained to align text and images, the "text vector" will naturally live in the exact same mathematical area as the vectors for images that contain pink glowing lights!
3. **Image Search (Online):** If you upload a reference image, it generates an image vector. 
4. **Retrieval:** Qdrant mathematically calculates the "Cosine Similarity" (the distance between vectors) to instantly find and return the images in the database that are closest to your text or image query.

## Architecture & Technology Stack

- **Backend Framework:** FastAPI (Python)
- **Machine Learning:** PyTorch, Hugging Face `transformers`, Pillow
- **Model:** `openai/clip-vit-base-patch32` (512 dimensions)
- **Vector Database:** Qdrant (via Docker)
- **Frontend Framework:** React + Vite + Tailwind CSS v4

## Computational Requirements

- **OS:** Windows 11 / Linux / macOS
- **RAM:** Minimum 8GB (Backend relies heavily on memory management for the model weights)
- **CPU:** The application leverages `torch.inference_mode()` and single-worker APIs to successfully execute on CPU environments without requiring dedicated GPUs.
- **Storage:** ~600MB available for downloading the CLIP model weights on the first run, plus Docker volume space.

## Requirements

1. Docker Desktop (for running Qdrant)
2. Python 3 (Virtual Environment)
3. Node.js & npm (for running the React frontend)
4. A catalog of images placed in `decorated-venues/<event-type>/...`

## Initialization & Docker Setup

### STEP 1: Start Qdrant Docker

Start a local instance of the Qdrant vector database. The `-v qdrant_storage` flag ensures your embeddings survive a PC reboot.

```powershell
docker run -d -p 6333:6333 -p 6334:6334 -v qdrant_storage:/qdrant/storage --name qdrant_app qdrant/qdrant
```

Ensure Qdrant is running by checking `docker ps` and visiting `http://127.0.0.1:6333`.

### STEP 2: Activate virtual environment and install dependencies

Open a PowerShell terminal in the project directory:

```powershell
cd D:\DVMS
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
pip install transformers
```

### STEP 3: Run indexing (Generating the 512D Vectors)

Before searching, you must generate embeddings for your catalog images and store them in Qdrant. The indexing script scans the `decorated-venues` directory, feeds each image through CLIP to generate a 512D vector, and upserts it into the `visual_search_index` collection.

```powershell
python -m backend.indexing
```

*Note: The first time you run this, it will automatically download the ~600MB CLIP model from the Hugging Face hub.*

This is an offline/infrequent process. You only need to re-run this when you add new images to your catalog. The script will automatically wipe and replace the vectors.

## How to Run the Code

To run the application daily or after a PC reboot, you need your Docker container, your backend server, and your frontend server running.

### 1. Ensure Docker is running
Open Docker Desktop. Open PowerShell and start the container we already created:
```powershell
docker start qdrant_app
```

### 2. Start the FastAPI Backend
In your PowerShell window, navigate to your project, activate the virtual environment, and start the FastAPI server:
```powershell
cd D:\DVMS
.\venv\Scripts\activate
uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
*(Leave this window open and running).*

### 3. Start the React Frontend
Open a **new** PowerShell tab or window, navigate to the frontend directory, and start Vite:
```powershell
cd D:\DVMS\frontend
npm run dev
```

### 4. Open the Interface
Open `http://localhost:5173` in your web browser.

You can now select an event type from the dropdown, choose between **Visual Search** (uploading an image) and **Text Search** (typing a prompt), and find your venues!

## Endpoints (Backend)

- `GET /health` - Health check status for Qdrant and the Model.
- `GET /events` - Returns dynamically discovered event types from the directory.
- `POST /search` - Image-based visual search endpoint.
- `POST /search/text` - Natural language text search endpoint.
- `GET /catalog/{path}` - Serves static catalog images securely.
