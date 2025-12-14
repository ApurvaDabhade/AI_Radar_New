# inventory_backend.py
import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# ========================
# Load Environment Variables
# ========================
load_dotenv()
MONGO_URI = os.getenv("mongodb://localhost:27017/")
DB_NAME = "inventory"
COLLECTION_NAME = "items"

# ========================
# MongoDB Setup (Async)
# ========================
client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

# ========================
# FastAPI App
# ========================
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========================
# Pydantic Model
# ========================
class InventoryItem(BaseModel):
    name: str
    quantity: float
    unit: str
    status: str
    expiryDays: int
    recommendation: Optional[str] = None

# ========================
# CRUD Functions
# ========================
async def get_items():
    items = []
    cursor = collection.find({})
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        items.append(doc)
    return items

async def add_item(item_data):
    result = await collection.insert_one(item_data)
    item_data["_id"] = str(result.inserted_id)
    return item_data

async def update_item(item_id, updated_data):
    await collection.update_one({"_id": item_id}, {"$set": updated_data})
    updated_data["_id"] = item_id
    return updated_data

async def delete_item(item_id):
    result = await collection.delete_one({"_id": item_id})
    return result.deleted_count

# ========================
# API Routes
# ========================
@app.get("/api/inventory")
async def fetch_inventory():
    return await get_items()

@app.post("/api/inventory")
async def create_inventory_item(item: InventoryItem):
    return await add_item(item.dict())

@app.put("/api/inventory/{item_id}")
async def edit_inventory_item(item_id: str, item: InventoryItem):
    updated_item = await update_item(item_id, item.dict())
    if not updated_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return updated_item

@app.delete("/api/inventory/{item_id}")
async def remove_inventory_item(item_id: str):
    deleted_count = await delete_item(item_id)
    if deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted successfully"}

# ========================
# Run: uvicorn inventory_backend:app --reload --port 5000
# ========================
