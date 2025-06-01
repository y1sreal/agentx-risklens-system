from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    technology: Optional[List[str]] = None
    purpose: Optional[List[str]] = None
    image_urls: Optional[List[str]] = None
    product_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    name: Optional[str] = None

class ProductInDB(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Product(ProductInDB):
    pass 