from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch

model_name = "openai/clip-vit-base-patch32"
model = CLIPModel.from_pretrained(model_name)
processor = CLIPProcessor.from_pretrained(model_name)

img = Image.new("RGB", (224, 224), color="red")
inputs = processor(images=img, return_tensors="pt")

out = model.get_image_features(**inputs)
print(type(out))
print(out.__class__.__name__)
