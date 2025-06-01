from sqlalchemy import Column, Integer, String, JSON, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    technology = Column(Text)  # JSON array of technologies
    purpose = Column(Text)     # JSON array of purposes/use cases
    image_urls = Column(Text)  # JSON array of product image URLs
    product_url = Column(String)  # ProductHunt URL
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    evaluations = relationship("Evaluation", back_populates="product") 