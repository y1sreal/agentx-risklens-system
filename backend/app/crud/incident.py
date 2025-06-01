from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.incident import Incident, Evaluation
from app.schemas.incident import IncidentCreate, IncidentUpdate, EvaluationCreate, EvaluationUpdate

# Incident CRUD operations
def get_incident(db: Session, incident_id: int) -> Optional[Incident]:
    return db.query(Incident).filter(Incident.id == incident_id).first()

def get_incidents(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    domain: Optional[str] = None,
    technology: Optional[str] = None,
    purpose: Optional[str] = None
) -> List[Incident]:
    query = db.query(Incident)
    
    if domain:
        query = query.filter(Incident.domain == domain)
    if technology:
        query = query.filter(Incident.technologies.contains([technology]))
    if purpose:
        query = query.filter(Incident.purposes.contains([purpose]))
    
    return query.offset(skip).limit(limit).all()

def create_incident(db: Session, incident: IncidentCreate) -> Incident:
    db_incident = Incident(**incident.model_dump())
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)
    return db_incident

def update_incident(
    db: Session, 
    incident_id: int, 
    incident: IncidentUpdate
) -> Optional[Incident]:
    db_incident = get_incident(db, incident_id)
    if not db_incident:
        return None
    
    update_data = incident.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_incident, field, value)
    
    db.commit()
    db.refresh(db_incident)
    return db_incident

def delete_incident(db: Session, incident_id: int) -> bool:
    db_incident = get_incident(db, incident_id)
    if not db_incident:
        return False
    
    db.delete(db_incident)
    db.commit()
    return True

# Evaluation CRUD operations
def get_evaluation(db: Session, evaluation_id: int) -> Optional[Evaluation]:
    return db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()

def get_evaluations(
    db: Session,
    product_id: Optional[int] = None,
    incident_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Evaluation]:
    query = db.query(Evaluation)
    
    if product_id:
        query = query.filter(Evaluation.product_id == product_id)
    if incident_id:
        query = query.filter(Evaluation.incident_id == incident_id)
    
    return query.offset(skip).limit(limit).all()

def create_evaluation(db: Session, evaluation: EvaluationCreate) -> Evaluation:
    db_evaluation = Evaluation(**evaluation.model_dump())
    db.add(db_evaluation)
    db.commit()
    db.refresh(db_evaluation)
    return db_evaluation

def update_evaluation(
    db: Session,
    evaluation_id: int,
    evaluation: EvaluationUpdate
) -> Optional[Evaluation]:
    db_evaluation = get_evaluation(db, evaluation_id)
    if not db_evaluation:
        return None
    
    update_data = evaluation.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_evaluation, field, value)
    
    db.commit()
    db.refresh(db_evaluation)
    return db_evaluation

def delete_evaluation(db: Session, evaluation_id: int) -> bool:
    db_evaluation = get_evaluation(db, evaluation_id)
    if not db_evaluation:
        return False
    
    db.delete(db_evaluation)
    db.commit()
    return True 