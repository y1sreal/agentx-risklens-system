from typing import List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import incident as incident_crud
from app.crud import product as product_crud
from app.schemas.incident import (
    Incident, IncidentCreate, IncidentUpdate,
    Evaluation, EvaluationCreate, EvaluationUpdate,
    IncidentWithScores,
    IncidentRetrievalResponse
)
from app.services.prism_service import PRISMScorer
from app.services.retrieval_service import (
    find_similar_incidents,
    generate_explanation,
    optimize_retrieval
)
from datetime import datetime

router = APIRouter()

# Initialize PRISM scorer
prism_scorer = PRISMScorer()

# Incident endpoints
@router.post("/", response_model=Incident)
def create_incident(
    *,
    db: Session = Depends(deps.get_db),
    incident_in: IncidentCreate
) -> Incident:
    """
    Create new incident.
    """
    incident = incident_crud.create_incident(db, incident_in)
    return incident

@router.get("/", response_model=List[Incident])
def read_incidents(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    risk_domain: Optional[str] = None,
    risk_level: Optional[str] = None
) -> List[Incident]:
    """
    Retrieve incidents with optional filtering.
    """
    return incident_crud.get_incidents(
        db,
        skip=skip,
        limit=limit,
        domain=risk_domain,
        # Note: risk_level is not supported by the CRUD function yet
    )

@router.get("/{incident_id}", response_model=Incident)
def read_incident(
    *,
    db: Session = Depends(deps.get_db),
    incident_id: int
) -> Incident:
    """
    Get incident by ID.
    """
    incident = incident_crud.get_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.put("/{incident_id}", response_model=Incident)
def update_incident(
    *,
    db: Session = Depends(deps.get_db),
    incident_id: int,
    incident_in: IncidentUpdate
) -> Incident:
    """
    Update an incident.
    """
    incident = incident_crud.get_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    incident = incident_crud.update_incident(db, incident_id, incident_in)
    return incident

@router.delete("/{incident_id}", response_model=Incident)
def delete_incident(
    *,
    db: Session = Depends(deps.get_db),
    incident_id: int
) -> dict:
    """
    Delete an incident.
    """
    incident = incident_crud.get_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    incident_crud.delete_incident(db, incident_id)
    return {"status": "success"}

# Evaluation endpoints
@router.post("/evaluations", response_model=Evaluation)
def create_evaluation(
    *,
    db: Session = Depends(deps.get_db),
    evaluation_in: EvaluationCreate
) -> Evaluation:
    """
    Create new evaluation.
    """
    evaluation = incident_crud.create_evaluation(db, evaluation_in)
    return evaluation

@router.get("/evaluations", response_model=List[Evaluation])
def read_evaluations(
    db: Session = Depends(deps.get_db),
    product_id: Optional[int] = Query(None),
    incident_id: Optional[int] = Query(None),
    skip: int = 0,
    limit: int = 100
) -> List[Evaluation]:
    """
    Retrieve evaluations with optional filtering.
    """
    evaluations = incident_crud.get_evaluations(
        db,
        product_id=product_id,
        incident_id=incident_id,
        skip=skip,
        limit=limit
    )
    return evaluations

@router.get("/evaluations/{evaluation_id}", response_model=Evaluation)
def read_evaluation(
    *,
    db: Session = Depends(deps.get_db),
    evaluation_id: int
) -> Evaluation:
    """
    Get evaluation by ID.
    """
    evaluation = incident_crud.get_evaluation(db, evaluation_id)
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return evaluation

@router.put("/evaluations/{evaluation_id}", response_model=Evaluation)
def update_evaluation(
    *,
    db: Session = Depends(deps.get_db),
    evaluation_id: int,
    evaluation_in: EvaluationUpdate
) -> Evaluation:
    """
    Update an evaluation.
    """
    evaluation = incident_crud.get_evaluation(db, evaluation_id)
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    evaluation = incident_crud.update_evaluation(db, evaluation_id, evaluation_in)
    return evaluation

@router.delete("/evaluations/{evaluation_id}")
def delete_evaluation(
    *,
    db: Session = Depends(deps.get_db),
    evaluation_id: int
) -> dict:
    """
    Delete an evaluation.
    """
    evaluation = incident_crud.get_evaluation(db, evaluation_id)
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    incident_crud.delete_evaluation(db, evaluation_id)
    return {"status": "success"}

# Retrieval endpoints
@router.get("/similar/{product_id}", response_model=IncidentRetrievalResponse)
async def get_similar_incidents(
    *,
    db: Session = Depends(deps.get_db),
    product_id: int,
    limit: int = Query(5, ge=1, le=20),
    sort_by: str = Query("similarity", regex="^(similarity|risk|relevance)$"),
    risk_domain: Optional[str] = None,
    min_similarity: float = Query(0.0, ge=0.0, le=1.0),
    min_risk_score: float = Query(0.0, ge=0.0, le=1.0)
):
    """
    Get similar incidents for a product with ranking and filtering options.
    """
    product = product_crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    incidents = await find_similar_incidents(
        product=product,
        db=db,
        limit=limit,
        sort_by=sort_by,
        risk_domain=risk_domain,
        min_similarity=min_similarity,
        min_risk_score=min_risk_score
    )
    
    return IncidentRetrievalResponse(
        incidents=incidents,
        total_count=len(incidents),
        page=1,
        page_size=limit,
        sort_by=sort_by,
        risk_domain=risk_domain
    )

@router.get("/explanation/{product_id}/{incident_id}")
async def get_incident_explanation(
    *,
    db: Session = Depends(deps.get_db),
    product_id: int,
    incident_id: int,
    mode: str = Query("generic", regex="^(generic|full_prism|none)$")
):
    """
    Get explanation of why an incident is relevant to a product.
    """
    product = product_crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    incident = incident_crud.get_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    explanation = await generate_explanation(
        product=product,
        incident=incident,
        mode=mode
    )
    
    return {"explanation": explanation}

@router.post("/optimize/{product_id}", response_model=IncidentRetrievalResponse)
async def optimize_incident_retrieval(
    *,
    db: Session = Depends(deps.get_db),
    product_id: int,
    feedback: List[dict],
    limit: int = Query(5, ge=1, le=20)
):
    """
    Optimize incident retrieval based on user feedback.
    """
    product = product_crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    incidents = await optimize_retrieval(
        product=product,
        db=db,
        feedback=feedback,
        limit=limit
    )
    
    return IncidentRetrievalResponse(
        incidents=incidents,
        total_count=len(incidents),
        page=1,
        page_size=limit,
        sort_by="relevance",
        risk_domain=None
    )

# PRISM Scoring endpoints
@router.post("/prism-score/{incident_id}/{product_id}")
async def calculate_prism_scores(
    *,
    db: Session = Depends(deps.get_db),
    incident_id: int,
    product_id: int
):
    """
    Calculate PRISM scores for an incident-product pair using real PRISM logic.
    """
    incident = incident_crud.get_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    product = product_crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Convert SQLAlchemy objects to dictionaries for PRISM scorer
    incident_dict = {
        'id': incident.id,
        'title': incident.title,
        'description': incident.description,
        'technologies': incident.technologies,
        'risk_level': incident.risk_level,
        'risk_domain': incident.risk_domain,
        'impact_scale': incident.impact_scale,
        'confidence_score': incident.confidence_score,
        'prism_scores': incident.prism_scores
    }
    
    product_dict = {
        'id': product.id,
        'name': product.name,
        'description': product.description,
        'technology': product.technology,
        'purpose': product.purpose
    }
    
    # Calculate PRISM scores using real logic
    prism_scores = prism_scorer.calculate_prism_scores(incident_dict, product_dict)
    
    # Calculate transferability score
    transferability_score = prism_scorer.calculate_transferability_score(prism_scores)
    
    # Generate explanation
    explanation = prism_scorer.get_explanation(prism_scores, incident_dict, product_dict)
    
    return {
        "incident_id": incident_id,
        "product_id": product_id,
        "prism_scores": prism_scores,
        "transferability_score": transferability_score,
        "explanation": explanation,
        "timestamp": datetime.now().isoformat()
    }

@router.get("/prism-batch/{product_id}")
async def get_prism_scores_batch(
    *,
    db: Session = Depends(deps.get_db),
    product_id: int,
    limit: int = Query(10, ge=1, le=50)
):
    """
    Get PRISM scores for multiple incidents against a single product.
    """
    product = product_crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get incidents
    incidents = incident_crud.get_incidents(db, limit=limit)
    
    results = []
    
    product_dict = {
        'id': product.id,
        'name': product.name,
        'description': product.description,
        'technology': product.technology,
        'purpose': product.purpose
    }
    
    for incident in incidents:
        incident_dict = {
            'id': incident.id,
            'title': incident.title,
            'description': incident.description,
            'technologies': incident.technologies,
            'risk_level': incident.risk_level,
            'risk_domain': incident.risk_domain,
            'impact_scale': incident.impact_scale,
            'confidence_score': incident.confidence_score,
            'prism_scores': incident.prism_scores
        }
        
        # Calculate PRISM scores
        prism_scores = prism_scorer.calculate_prism_scores(incident_dict, product_dict)
        transferability_score = prism_scorer.calculate_transferability_score(prism_scores)
        
        results.append({
            "incident": {
                "id": incident.id,
                "title": incident.title,
                "risk_level": incident.risk_level,
                "risk_domain": incident.risk_domain
            },
            "prism_scores": prism_scores,
            "transferability_score": transferability_score
        })
    
    # Sort by transferability score (highest first)
    results.sort(key=lambda x: x["transferability_score"], reverse=True)
    
    return {
        "product_id": product_id,
        "product_name": product.name,
        "total_incidents": len(results),
        "results": results,
        "timestamp": datetime.now().isoformat()
    } 