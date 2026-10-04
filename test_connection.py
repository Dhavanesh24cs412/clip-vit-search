from qdrant_client import QdrantClient

# Connect to the local instance
client = QdrantClient(host="localhost", port=6333)

print("Connected collections:", client.get_collections())