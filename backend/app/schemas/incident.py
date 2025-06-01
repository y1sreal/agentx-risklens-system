from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class IncidentBase(BaseModel):
    title: str
    description: str
    domain: str
    impact: str
    technologies: List[str]
    purposes: List[str]
    ethical_issues: List[str]
    logical_coherence: float
    factual_accuracy: float
    practical_implementability: float
    contextual_relevance: float
    uniqueness: float
    impact_scale: float
    risk_level: str
    risk_domain: str
    risk_confidence: float

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(IncidentBase):
    pass

class IncidentInDB(IncidentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Incident(IncidentInDB):
    pass

class EvaluationBase(BaseModel):
    product_id: int
    incident_id: int
    relevance_score: float
    similarity_score: float
    explanation_mode: str
    user_feedback: Optional[str] = None

class EvaluationCreate(EvaluationBase):
    pass

class EvaluationUpdate(EvaluationBase):
    pass

class EvaluationInDB(EvaluationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Evaluation(EvaluationInDB):
    pass

# Response models for retrieval
class IncidentWithScores(Incident):
    similarity_score: float
    relevance_score: float
    risk_score: float

class IncidentRetrievalResponse(BaseModel):
    incidents: List[IncidentWithScores]
    total_count: int
    page: int
    page_size: int
    sort_by: str
    risk_domain: Optional[str] = None 