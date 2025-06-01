"""
System Statistics API Endpoints
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models.product import Product
from app.models.incident import Incident
from app.models.models import IncidentProductMapping

router = APIRouter()

@router.get("/stats")
def get_system_stats(db: Session = Depends(deps.get_db)):
    """
    Get comprehensive system statistics
    """
    # Count products
    total_products = db.query(Product).count()
    
    # Count incidents  
    total_incidents = db.query(Incident).count()
    
    # Count mappings
    total_mappings = db.query(IncidentProductMapping).count()
    
    # Count products with images (non-empty image_urls)
    products_with_images = db.query(Product).filter(
        Product.image_urls != "[]"
    ).filter(
        Product.image_urls != ""
    ).count()
    
    # Count human-validated mappings
    human_validated_mappings = db.query(IncidentProductMapping).filter(
        IncidentProductMapping.is_human_validated == True
    ).count()
    
    return {
        "total_products": total_products,
        "total_incidents": total_incidents,
        "total_mappings": total_mappings,
        "products_with_images": products_with_images,
        "human_validated_mappings": human_validated_mappings
    } 