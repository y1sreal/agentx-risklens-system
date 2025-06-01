"""
Products API Endpoints
"""

from typing import List, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from app.api import deps
from app.models.product import Product
from app.services.retrieval_service import find_similar_incidents
from pydantic import BaseModel
import json
import math

router = APIRouter()

class ApiProduct(BaseModel):
    id: int
    name: str
    description: str
    technology: List[str]
    purpose: List[str]
    image_urls: List[str]
    product_url: str

class ProductCreate(BaseModel):
    name: str
    description: str
    technology: List[str] = []
    purpose: List[str] = []
    image_urls: List[str] = []
    product_url: str = ""

class PaginatedResponse(BaseModel):
    items: List[ApiProduct]
    total: int
    page: int
    limit: int
    total_pages: int

def parse_json_field(field_value, default_list=None):
    """Parse JSON field, handling both string and list formats including nested strings"""
    if default_list is None:
        default_list = []
    
    if not field_value:
        return default_list
    
    if isinstance(field_value, list):
        return field_value
    
    if isinstance(field_value, str):
        try:
            # First try to parse as JSON
            parsed = json.loads(field_value)
            if isinstance(parsed, list):
                # Check if it's a list with string representation inside
                if len(parsed) == 1 and isinstance(parsed[0], str):
                    # Try to parse the inner string as a list
                    try:
                        inner_parsed = json.loads(parsed[0])
                        if isinstance(inner_parsed, list):
                            return inner_parsed
                    except:
                        # If inner parsing fails, check if it looks like a Python list
                        inner_str = parsed[0]
                        if inner_str.startswith('[') and inner_str.endswith(']'):
                            try:
                                # Use eval for Python list string format (like "['url1', 'url2']")
                                inner_list = eval(inner_str)
                                if isinstance(inner_list, list):
                                    return inner_list
                            except:
                                pass
                        return [inner_str]  # Return as single item if can't parse
                return parsed
            return default_list
        except (json.JSONDecodeError, TypeError):
            return default_list
    
    return default_list

def convert_db_product_to_api(db_product) -> ApiProduct:
    """Convert database product to API product format"""
    return ApiProduct(
        id=db_product.id,
        name=db_product.name or "",
        description=db_product.description or "",
        technology=parse_json_field(db_product.technology),
        purpose=parse_json_field(db_product.purpose),
        image_urls=parse_json_field(db_product.image_urls),
        product_url=db_product.product_url or ""
    )

@router.get("/", response_model=PaginatedResponse)
def get_products(
    db: Session = Depends(deps.get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    search: Optional[str] = Query(None)
):
    """
    Get products with pagination and search functionality.
    """
    # Build query
    query = db.query(Product)
    
    # Apply search filter if provided
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_term),
                Product.description.ilike(search_term)
            )
        )
    
    # Get total count
    total = query.count()
    
    # Calculate pagination
    offset = (page - 1) * limit
    total_pages = math.ceil(total / limit)
    
    # Get products for current page
    db_products = query.offset(offset).limit(limit).all()
    
    # Convert to API format
    products = [convert_db_product_to_api(db_product) for db_product in db_products]
    
    return PaginatedResponse(
        items=products,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/{product_id}", response_model=ApiProduct)
def get_product(
    product_id: int,
    db: Session = Depends(deps.get_db)
):
    """
    Get product by ID.
    """
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return convert_db_product_to_api(db_product)

@router.post("/", response_model=ApiProduct)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(deps.get_db)
):
    """
    Create new product.
    """
    # Create new product instance
    db_product = Product(
        name=product_in.name,
        description=product_in.description,
        technology=json.dumps(product_in.technology),
        purpose=json.dumps(product_in.purpose),
        image_urls=json.dumps(product_in.image_urls),
        product_url=product_in.product_url
    )
    
    # Add to database
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    return convert_db_product_to_api(db_product)

@router.put("/{product_id}", response_model=ApiProduct)
def update_product(
    product_id: int,
    product_in: ProductCreate,
    db: Session = Depends(deps.get_db)
):
    """
    Update a product.
    """
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Update fields
    db_product.name = product_in.name
    db_product.description = product_in.description
    db_product.technology = json.dumps(product_in.technology)
    db_product.purpose = json.dumps(product_in.purpose)
    db_product.image_urls = json.dumps(product_in.image_urls)
    db_product.product_url = product_in.product_url
    
    db.commit()
    db.refresh(db_product)
    
    return convert_db_product_to_api(db_product)

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(deps.get_db)
):
    """
    Delete a product.
    """
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(db_product)
    db.commit()
    
    return {"status": "success"} 

@router.get("/{product_id}/incidents")
async def get_product_incidents(
    product_id: int,
    db: Session = Depends(deps.get_db),
    limit: int = Query(10, ge=1, le=50),
    sort_by: str = Query("similarity", regex="^(similarity|risk|relevance)$"),
    risk_domain: Optional[str] = None,
    min_similarity: float = Query(0.0, ge=0.0, le=1.0),
    min_risk_score: float = Query(0.0, ge=0.0, le=1.0)
):
    """
    Get incidents for a specific product using REAL similarity matching with PRISM analysis
    """
    # Check if product exists
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    try:
        # Convert database product to the format expected by similarity service
        from app.models.product import Product as ProductModel
        
        # Parse JSON fields from database
        technology = parse_json_field(db_product.technology)
        purpose = parse_json_field(db_product.purpose)
        
        # Create a product object for the similarity service
        # Note: We'll create a mock object with the necessary attributes
        class ProductForSimilarity:
            def __init__(self, db_product, technology, purpose):
                self.id = db_product.id
                self.name = db_product.name or ""
                self.description = db_product.description or ""
                self.technology = technology
                self.purpose = purpose
                # Add empty lists for fields not in our schema but expected by similarity service
                self.ethical_issues = []
        
        product_obj = ProductForSimilarity(db_product, technology, purpose)
        
        # Use the real similarity service to find incidents
        similar_incidents = await find_similar_incidents(
            product=product_obj,
            db=db,
            limit=limit,
            sort_by=sort_by,
            risk_domain=risk_domain,
            min_similarity=min_similarity,
            min_risk_score=min_risk_score
        )
        
        # Convert IncidentWithScores objects to dict format for JSON response
        incidents_data = []
        for incident in similar_incidents:
            incidents_data.append({
                "id": incident.id,
                "title": incident.title,
                "description": incident.description,
                "domain": incident.domain,
                "impact": incident.impact,
                "technologies": incident.technologies,
                "purposes": incident.purposes,
                "ethical_issues": incident.ethical_issues,
                "logical_coherence": incident.logical_coherence,
                "factual_accuracy": incident.factual_accuracy,
                "practical_implementability": incident.practical_implementability,
                "contextual_relevance": incident.contextual_relevance,
                "uniqueness": incident.uniqueness,
                "impact_scale": incident.impact_scale,
                "risk_level": incident.risk_level,
                "risk_domain": incident.risk_domain,
                "risk_confidence": incident.risk_confidence,
                "similarity_score": incident.similarity_score,
                "relevance_score": incident.relevance_score,
                "risk_score": incident.risk_score,
                "created_at": incident.created_at.isoformat() if incident.created_at else None,
                "updated_at": incident.updated_at.isoformat() if incident.updated_at else None,
                "prism_scores": {
                    "logical_coherence": incident.logical_coherence,
                    "factual_accuracy": incident.factual_accuracy,
                    "practical_implementability": incident.practical_implementability,
                    "contextual_relevance": incident.contextual_relevance,
                    "uniqueness": incident.uniqueness,
                    "impact": incident.impact_scale
                }
            })
        
        return {
            "product_id": product_id,
            "product_name": db_product.name,
            "total_incidents": len(incidents_data),
            "incidents": incidents_data,
            "sort_by": sort_by,
            "risk_domain": risk_domain
        }
        
    except Exception as e:
        print(f"Error in get_product_incidents: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error retrieving incidents: {str(e)}") 