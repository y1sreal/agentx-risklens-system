from sqlalchemy import Column, Integer, String, JSON, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    technologies = Column(Text)      # JSON array of technologies
    risk_level = Column(String)      # high/medium/low
    risk_domain = Column(String)     # Safety/Ethics/Privacy/Security
    impact_scale = Column(Float)     # Average of individual/group/global impacts
    confidence_score = Column(Float) # Confidence in the incident-product mapping
    prism_scores = Column(Text)      # JSON object with all PRISM dimensions (1-5 scale)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    evaluations = relationship("Evaluation", back_populates="incident")

class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    incident_id = Column(Integer, ForeignKey("incidents.id"))
    relevance_score = Column(Float)
    similarity_score = Column(Float)  # 0-1 similarity score
    explanation_mode = Column(String)  # none, generic, full_prism
    user_feedback = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    product = relationship("Product", back_populates="evaluations")
    incident = relationship("Incident", back_populates="evaluations")
    
# Alternative evaluation model for feedback table created by migration
class Feedback(Base):
    __tablename__ = "feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"))
    user_comment = Column(Text)
    relevance = Column(Integer)
    prism_scores = Column(Text)  # JSON stored as TEXT
    created_at = Column(String)  # SQLite datetime as string 