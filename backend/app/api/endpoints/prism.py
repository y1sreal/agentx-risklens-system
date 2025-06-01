"""
PRISM Scoring API Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.services.prism_service import PRISMScorer
from pydantic import BaseModel
from typing import List
import logging

router = APIRouter()

# Initialize PRISM scorer
prism_scorer = PRISMScorer()

class PRISMScoreRequest(BaseModel):
    product_name: str
    product_description: str
    incident_description: str
    context: str = ""
    mode: str = "prism"  # Add mode parameter: "prism" or "generic"

class PRISMScoreResponse(BaseModel):
    logical_coherence: float
    factual_accuracy: float
    practical_implementability: float
    contextual_relevance: float
    impact: float
    exploitability: float
    overall_score: float
    reasoning: str

class BatchPRISMRequest(BaseModel):
    requests: List[PRISMScoreRequest]

class BulkPRISMRequest(BaseModel):
    product_name: str
    product_description: str
    incidents: List[dict]  # List of incidents with id, title, description, technologies
    context: str = ""
    mode: str = "prism"

class IncidentScore(BaseModel):
    incident_id: int
    confidence_score: float = None  # For generic mode
    logical_coherence: float = None  # For PRISM mode
    factual_accuracy: float = None
    practical_implementability: float = None
    contextual_relevance: float = None
    impact: float = None
    exploitability: float = None
    overall_score: float = None
    reasoning: str

class BulkPRISMResponse(BaseModel):
    incident_scores: List[IncidentScore]

@router.post("/score", response_model=PRISMScoreResponse)
async def calculate_prism_score(request: PRISMScoreRequest):
    """
    Calculate PRISM scores for a product-incident pair using the 6-dimension methodology,
    or generic confidence scores based on the mode parameter.
    """
    try:
        print(f"=== PRISM API Called ===")
        print(f"Mode: {request.mode}")
        print(f"Product: {request.product_name}")
        
        # Prepare data for scorer
        incident_data = {
            'system_name': 'Incident Analysis',
            'description': request.incident_description,
            'context': request.context
        }
        
        product_data = {
            'name': request.product_name,
            'description': request.product_description
        }
        
        # Choose scoring method based on mode
        if request.mode == "generic":
            print(">>> Taking GENERIC path")
            # Use generic confidence scoring
            result = prism_scorer.calculate_generic_confidence_score(incident_data, product_data)
            print(f"Generic result: {result}")
            
            # For generic mode, only the overall score is meaningful
            # Set other dimensions to indicate they're not applicable
            confidence_score = result.get('confidence_score', 3.0)
            
            return PRISMScoreResponse(
                logical_coherence=confidence_score,  # Use confidence score for all dimensions in generic mode
                factual_accuracy=confidence_score,
                practical_implementability=confidence_score,
                contextual_relevance=confidence_score,
                impact=confidence_score,
                exploitability=confidence_score,
                overall_score=confidence_score,
                reasoning=f"Generic Analysis: {result.get('reasoning', 'Generic confidence assessment')}"
            )
        else:
            print(">>> Taking PRISM path")
            # Use authentic PRISM methodology
            result = prism_scorer.calculate_authentic_prism_scores(incident_data, product_data)
            print(f"PRISM result transferability: {result.get('transferability_score', 'N/A')}")
            
            # Extract scores
            scores = result.get('prism_scores', {})
            rationales = result.get('prism_rationales', {})
            
            # Create combined reasoning
            reasoning_parts = []
            for dimension, rationale in rationales.items():
                reasoning_parts.append(f"{dimension.replace('_', ' ').title()}: {rationale}")
            
            reasoning = "; ".join(reasoning_parts)
            
            # Calculate overall score
            overall_score = result.get('transferability_score', 3.0)
            
            return PRISMScoreResponse(
                logical_coherence=scores.get('logical_coherence', 3.0),
                factual_accuracy=scores.get('factual_accuracy', 3.0),
                practical_implementability=scores.get('practical_implementability', 3.0),
                contextual_relevance=scores.get('contextual_relevance', 3.0),
                impact=scores.get('impact', 3.0),
                exploitability=scores.get('exploitability', 3.0),
                overall_score=overall_score,
                reasoning=reasoning
            )
        
    except Exception as e:
        logging.error(f"Error calculating score: {e}")
        # Return default scores on error
        return PRISMScoreResponse(
            logical_coherence=3.0,
            factual_accuracy=3.0,
            practical_implementability=3.0,
            contextual_relevance=3.0,
            impact=3.0,
            exploitability=3.0,
            overall_score=3.0,
            reasoning=f"Error in calculation: {str(e)}"
        )

@router.post("/score/batch", response_model=List[PRISMScoreResponse])
async def batch_calculate_prism_score(batch_request: BatchPRISMRequest):
    """
    Calculate PRISM scores for multiple product-incident pairs.
    """
    results = []
    
    for request in batch_request.requests:
        try:
            score_response = await calculate_prism_score(request)
            results.append(score_response)
        except Exception as e:
            logging.error(f"Error in batch calculation: {e}")
            # Add default score for failed calculation
            results.append(PRISMScoreResponse(
                logical_coherence=3.0,
                factual_accuracy=3.0,
                practical_implementability=3.0,
                contextual_relevance=3.0,
                impact=3.0,
                exploitability=3.0,
                overall_score=3.0,
                reasoning=f"Error in calculation: {str(e)}"
            ))
    
    return results

@router.post("/score/bulk", response_model=BulkPRISMResponse)
async def bulk_calculate_prism_score(bulk_request: BulkPRISMRequest):
    """
    Calculate scores for all incidents in ONE API call with structured output.
    Uses 1-100 scoring scale and proper PRISM weights.
    """
    try:
        print(f"=== BULK PRISM API Called ===")
        print(f"Mode: {bulk_request.mode}")
        print(f"Product: {bulk_request.product_name}")
        print(f"Processing {len(bulk_request.incidents)} incidents in one call")
        
        # Prepare data for scorer
        product_data = {
            'name': bulk_request.product_name,
            'description': bulk_request.product_description
        }
        
        # Process ALL incidents in one call
        if bulk_request.mode == "generic":
            print(">>> Taking BULK GENERIC path")
            result = prism_scorer.bulk_calculate_generic_scores(bulk_request.incidents, product_data, bulk_request.context)
        else:
            print(">>> Taking BULK PRISM path")
            result = prism_scorer.bulk_calculate_prism_scores(bulk_request.incidents, product_data, bulk_request.context)
        
        return BulkPRISMResponse(incident_scores=result)
        
    except Exception as e:
        logging.error(f"Error in bulk calculation: {e}")
        # Return default scores for all incidents
        default_scores = []
        for incident in bulk_request.incidents:
            if bulk_request.mode == "generic":
                default_scores.append(IncidentScore(
                    incident_id=incident['id'],
                    confidence_score=50.0,  # 1-100 scale
                    reasoning="Error in calculation"
                ))
            else:
                default_scores.append(IncidentScore(
                    incident_id=incident['id'],
                    logical_coherence=50.0,
                    factual_accuracy=50.0,
                    practical_implementability=50.0,
                    contextual_relevance=50.0,
                    impact=50.0,
                    exploitability=50.0,
                    overall_score=50.0,
                    reasoning="Error in calculation"
                ))
        
        return BulkPRISMResponse(incident_scores=default_scores) 