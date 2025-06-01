from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Table, JSON, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    technology = Column(String)  # JSON array as string
    purpose = Column(String)     # JSON array as string
    image_urls = Column(String)  # JSON array of image URLs as string
    product_url = Column(String) # ProductHunt URL
    pricing_model = Column(String)  # Pricing model info
    user_count = Column(String)     # User count info
    created_at = Column(String)  # Stored as ISO string in the database
    updated_at = Column(String)  # Stored as ISO string in the database

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    technologies = Column(String)    # JSON array as string
    risk_level = Column(String)      # high/medium/low
    risk_domain = Column(String)     # Safety/Ethics/Privacy/Security
    impact_scale = Column(Float)     # Single impact score
    confidence_score = Column(Float) # Confidence in the mapping
    prism_scores = Column(String)    # JSON object with 6 PRISM dimensions as string
    created_at = Column(String)      # Stored as ISO string
    updated_at = Column(String)      # Stored as ISO string

class IncidentProductMapping(Base):
    __tablename__ = "incident_product_mappings"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    mapping_confidence = Column(Float)        # How confident is this mapping
    transferability_score = Column(Float)     # Overall PRISM score
    is_human_validated = Column(Boolean)      # Has human IRR validation
    created_at = Column(String)               # Stored as ISO string

class PRISMScore(Base):
    __tablename__ = "prism_scores"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"))
    logical_coherence = Column(Float)
    factual_accuracy = Column(Float)
    practical_implementability = Column(Float)
    contextual_relevance = Column(Float)
    uniqueness = Column(Float)
    impact_scale = Column(Float)
    reasoning = Column(String)  # LLM-generated reasoning
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    user_feedback = Column(String)
    rating = Column(Integer)
    created_at = Column(String)  # Stored as ISO string 