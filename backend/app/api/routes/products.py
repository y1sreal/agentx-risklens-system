from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.services.llm_service import predict_indices

router = APIRouter()

class ProductBase(BaseModel):
    name: str
    description: str
    technology: List[str]
    purpose: List[str]
    ethical_issues: List[str]

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class IndexPredictionRequest(BaseModel):
    description: str

class IndexPredictionResponse(BaseModel):
    technology: List[str]
    purpose: List[str]
    ethical_issues: List[str]

# Temporary in-memory storage (replace with database later)
products_db = []
current_id = 1

@router.post("/predict-indices", response_model=IndexPredictionResponse)
async def predict_product_indices(request: IndexPredictionRequest):
    try:
        # Call LLM service to predict indices
        predictions = await predict_indices(request.description)
        return predictions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/products", response_model=Product)
async def create_product(product: ProductCreate):
    global current_id
    now = datetime.utcnow()
    new_product = Product(
        id=current_id,
        created_at=now,
        updated_at=now,
        **product.model_dump()
    )
    products_db.append(new_product)
    current_id += 1
    return new_product

@router.get("/products", response_model=List[Product])
async def get_products():
    return products_db

@router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: int):
    for product in products_db:
        if product.id == product_id:
            return product
    raise HTTPException(status_code=404, detail="Product not found") 