from typing import List, Dict, Optional
import openai
import json
from app.core.config import settings
from app.models.product import Product
from app.models.incident import Incident
from app.schemas.incident import IncidentWithScores
from app.crud import incident as incident_crud
from sqlalchemy.orm import Session

async def calculate_similarity_score(product: Product, incident: Incident) -> float:
    """
    Calculate similarity score between product and incident.
    """
    try:
        prompt = f"""Calculate a similarity score (0-1) between this AI product and incident:

        Product:
        Name: {product.name}
        Description: {product.description}
        Technologies: {', '.join(product.technology)}
        Purposes: {', '.join(product.purpose)}
        Ethical Issues: {', '.join(product.ethical_issues)}

        Incident:
        Title: {incident.title}
        Description: {incident.description}
        Technologies: {', '.join(incident.technologies)}
        Purposes: {', '.join(incident.purposes)}
        Ethical Issues: {', '.join(incident.ethical_issues)}

        Consider:
        1. Technology overlap
        2. Purpose alignment
        3. Ethical issue relevance
        4. Domain similarity
        """

        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert at calculating similarity scores between AI products and incidents."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=100
        )

        # Parse the response to get the similarity score
        score = float(response.choices[0].message.content.strip())
        return min(max(score, 0.0), 1.0)  # Ensure score is between 0 and 1

    except Exception as e:
        print(f"Error in calculate_similarity_score: {str(e)}")
        return 0.0

async def calculate_risk_score(incident: Incident) -> float:
    """
    Calculate overall risk score based on PRISM scores and risk metrics.
    """
    # Weighted average of PRISM scores and risk metrics
    weights = {
        'logical_coherence': 0.1,
        'factual_accuracy': 0.1,
        'practical_implementability': 0.1,
        'contextual_relevance': 0.2,
        'uniqueness': 0.2,
        'impact_scale': 0.2,
        'risk_confidence': 0.1
    }
    
    risk_level_map = {'Low': 0.3, 'Medium': 0.6, 'High': 0.9}
    
    score = (
        incident.logical_coherence * weights['logical_coherence'] +
        incident.factual_accuracy * weights['factual_accuracy'] +
        incident.practical_implementability * weights['practical_implementability'] +
        incident.contextual_relevance * weights['contextual_relevance'] +
        incident.uniqueness * weights['uniqueness'] +
        incident.impact_scale * weights['impact_scale'] +
        incident.risk_confidence * weights['risk_confidence']
    )
    
    # Adjust score based on risk level
    risk_level_factor = risk_level_map.get(incident.risk_level, 0.5)
    return score * risk_level_factor

async def find_similar_incidents(
    product: Product,
    db: Session,
    limit: int = 5,
    sort_by: str = "similarity",
    risk_domain: Optional[str] = None,
    min_similarity: float = 0.0,
    min_risk_score: float = 0.0
) -> List[IncidentWithScores]:
    """
    Find and rank similar incidents based on various criteria using REAL database incidents.
    """
    try:
        print(f"DEBUG: Starting find_similar_incidents for product: {product.name}")
        print(f"DEBUG: Product technology type: {type(product.technology)}, value: {product.technology}")
        print(f"DEBUG: Product purpose type: {type(product.purpose)}, value: {product.purpose}")
        
        # Get all incidents from database
        all_incidents = incident_crud.get_incidents(db, limit=1000)  # Get a large batch
        print(f"DEBUG: Found {len(all_incidents)} incidents in database")
        
        if not all_incidents:
            print("DEBUG: No incidents found in database")
            return []
        
        # Create a basic similarity scoring function
        def calculate_text_similarity(product_text: str, incident_text: str) -> float:
            """Simple text similarity using word overlap"""
            try:
                product_words = set(product_text.lower().split())
                incident_words = set(incident_text.lower().split())
                
                if not product_words or not incident_words:
                    return 0.0
                    
                intersection = product_words.intersection(incident_words)
                union = product_words.union(incident_words)
                
                return len(intersection) / len(union) if union else 0.0
            except Exception as e:
                print(f"DEBUG: Error in calculate_text_similarity: {e}")
                return 0.0
        
        def calculate_technology_overlap(product_tech: list, incident_tech: list) -> float:
            """Calculate technology overlap score"""
            try:
                if not product_tech or not incident_tech:
                    return 0.0
                    
                product_tech_set = set([tech.lower() for tech in product_tech])
                incident_tech_set = set([tech.lower() for tech in incident_tech])
                
                intersection = product_tech_set.intersection(incident_tech_set)
                union = product_tech_set.union(incident_tech_set)
                
                return len(intersection) / len(union) if union else 0.0
            except Exception as e:
                print(f"DEBUG: Error in calculate_technology_overlap: {e}")
                return 0.0
        
        # Calculate similarity scores for each incident
        scored_incidents = []
        product_text = f"{product.name} {product.description}"
        
        # Parse product technology and purpose fields (they might be JSON strings)
        try:
            product_technologies = json.loads(product.technology) if isinstance(product.technology, str) else product.technology
        except:
            product_technologies = product.technology if product.technology else []
            
        try:
            product_purposes = json.loads(product.purpose) if isinstance(product.purpose, str) else product.purpose
        except:
            product_purposes = product.purpose if product.purpose else []
        
        for incident in all_incidents:
            try:
                incident_text = f"{incident.title} {incident.description}"
                
                # Parse incident technologies (stored as JSON string in database)
                try:
                    incident_technologies = json.loads(incident.technologies) if isinstance(incident.technologies, str) else incident.technologies
                except:
                    incident_technologies = incident.technologies if incident.technologies else []
                
                # Calculate different similarity metrics
                text_similarity = calculate_text_similarity(product_text, incident_text)
                tech_similarity = calculate_technology_overlap(product_technologies, incident_technologies)
                
                # Combined similarity score (weighted)
                similarity_score = (text_similarity * 0.4) + (tech_similarity * 0.6)
                
                # Calculate risk score based on impact and confidence
                risk_score = (incident.impact_scale + incident.confidence_score) / 2 if incident.impact_scale and incident.confidence_score else 0.5
                
                # Apply filters
                if (similarity_score >= min_similarity and 
                    risk_score >= min_risk_score and 
                    (risk_domain is None or incident.risk_domain == risk_domain)):
                    
                    # Parse PRISM scores from JSON string
                    try:
                        prism_scores = json.loads(incident.prism_scores) if isinstance(incident.prism_scores, str) else incident.prism_scores
                    except:
                        prism_scores = {}
                    
                    scored_incidents.append(IncidentWithScores(
                        id=incident.id,
                        title=incident.title,
                        description=incident.description,
                        domain=incident.risk_domain,  # Map risk_domain to domain
                        impact=str(incident.impact_scale),  # Convert to string
                        technologies=incident_technologies,
                        purposes=[],  # Not stored in current schema
                        ethical_issues=[],  # Not stored in current schema
                        logical_coherence=prism_scores.get('logical_coherence', 3),
                        factual_accuracy=prism_scores.get('factual_accuracy', 3),
                        practical_implementability=prism_scores.get('practical_implementability', 3),
                        contextual_relevance=prism_scores.get('contextual_relevance', 3),
                        uniqueness=prism_scores.get('uniqueness', 3),
                        impact_scale=incident.impact_scale or 3,
                        risk_level=incident.risk_level,
                        risk_domain=incident.risk_domain,
                        risk_confidence=incident.confidence_score or 0.8,
                        created_at=incident.created_at,
                        updated_at=incident.updated_at,
                        similarity_score=similarity_score,
                        relevance_score=similarity_score * risk_score,  # Combined score
                        risk_score=risk_score
                    ))
                    
            except Exception as e:
                print(f"DEBUG: Error processing incident {incident.id}: {e}")
                continue
        
        print(f"DEBUG: Scored {len(scored_incidents)} incidents")
        
        # Sort based on criteria
        if sort_by == "similarity":
            scored_incidents.sort(key=lambda x: x.similarity_score, reverse=True)
        elif sort_by == "risk":
            scored_incidents.sort(key=lambda x: x.risk_score, reverse=True)
        elif sort_by == "relevance":
            scored_incidents.sort(key=lambda x: x.relevance_score, reverse=True)
        
        result = scored_incidents[:limit]
        print(f"DEBUG: Returning top {len(result)} incidents")
        return result

    except Exception as e:
        print(f"Error in find_similar_incidents: {str(e)}")
        import traceback
        traceback.print_exc()
        return []

async def optimize_retrieval(
    product: Product,
    db: Session,
    feedback: List[Dict],
    limit: int = 5
) -> List[IncidentWithScores]:
    """
    Optimize incident retrieval based on user feedback.
    """
    try:
        # Create a prompt for the LLM to learn from feedback
        feedback_text = "\n".join([
            f"Incident {f['incident_id']}: {f['feedback']}"
            for f in feedback
        ])
        
        prompt = f"""Based on this user feedback for incident retrieval:
        {feedback_text}
        
        For this product:
        Name: {product.name}
        Description: {product.description}
        Technologies: {', '.join(product.technology)}
        Purposes: {', '.join(product.purpose)}
        Ethical Issues: {', '.join(product.ethical_issues)}
        
        Suggest improvements to the retrieval process.
        """

        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert at optimizing incident retrieval based on user feedback."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=500
        )

        # In a real implementation, this would update the retrieval model
        # For now, we'll just return the original results
        return await find_similar_incidents(product, db, limit)

    except Exception as e:
        print(f"Error in optimize_retrieval: {str(e)}")
        return []

async def generate_explanation(
    product: Product,
    incident: Incident,
    mode: str = "generic"
) -> str:
    """
    Generate explanation for why an incident is relevant to a product.
    """
    try:
        if mode == "none":
            return ""

        prompt = f"""Explain why this incident is relevant to this AI product:

        Product:
        Name: {product.name}
        Description: {product.description}
        Technologies: {', '.join(product.technology)}
        Purposes: {', '.join(product.purpose)}
        Ethical Issues: {', '.join(product.ethical_issues)}

        Incident:
        Title: {incident.title}
        Description: {incident.description}
        Domain: {incident.domain}
        Impact: {incident.impact}
        Technologies: {', '.join(incident.technologies)}
        Purposes: {', '.join(incident.purposes)}
        Ethical Issues: {', '.join(incident.ethical_issues)}
        PRISM Scores:
        - Logical Coherence: {incident.logical_coherence}
        - Factual Accuracy: {incident.factual_accuracy}
        - Practical Implementability: {incident.practical_implementability}
        - Contextual Relevance: {incident.contextual_relevance}
        - uniqueness: {incident.uniqueness}
        - Impact Scale: {incident.impact_scale}
        Risk Level: {incident.risk_level}
        Risk Domain: {incident.risk_domain}

        {'Provide a detailed explanation using the PRISM framework.' if mode == 'full_prism' else 'Provide a brief explanation of the key similarities.'}
        """

        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert at explaining AI incident transferability.
                    For a given product and incident, explain why the incident is relevant
                    and what lessons can be learned."""
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=500
        )

        return response.choices[0].message.content

    except Exception as e:
        print(f"Error in generate_explanation: {str(e)}")
        return "Error generating explanation" 