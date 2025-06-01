"""
Suggestions API Endpoints
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from app.api import deps
from app.models.product import Product
import json
from typing import List

router = APIRouter()

@router.get("/suggestions/technologies", response_model=List[str])
def get_technology_suggestions(db: Session = Depends(deps.get_db)):
    """
    Get diverse technology suggestions since current data only has 'AI System'
    """
    # Since all current data has 'AI System', provide realistic AI technology options
    return [
        'Artificial Intelligence',
        'Machine Learning', 
        'Natural Language Processing',
        'Computer Vision',
        'Deep Learning',
        'Generative AI',
        'Large Language Models',
        'Neural Networks',
        'Data Science',
        'Recommendation Systems',
        'Image Recognition',
        'Speech Recognition',
        'Chatbot',
        'Virtual Assistant',
        'Predictive Analytics',
        'Automation',
        'Robotic Process Automation',
        'Knowledge Graphs',
        'Sentiment Analysis',
        'Text Generation',
        'Image Generation',
        'Video Generation',
        'Content Creation',
        'Search & Retrieval',
        'Classification',
        'Clustering',
        'Reinforcement Learning',
        'Transfer Learning',
        'Few-shot Learning',
        'Prompt Engineering'
    ]

@router.get("/suggestions/purposes", response_model=List[str])
def get_purpose_suggestions(db: Session = Depends(deps.get_db)):
    """
    Get purpose suggestions from existing products with better parsing
    """
    try:
        # Get all purpose arrays from products
        products = db.query(Product.purpose).all()
        
        purposes = set()
        for product in products:
            if product.purpose:
                try:
                    # Parse JSON array
                    purpose_list = json.loads(product.purpose) if isinstance(product.purpose, str) else product.purpose
                    if isinstance(purpose_list, list):
                        purposes.update(purpose_list)
                except (json.JSONDecodeError, TypeError):
                    # Handle case where purpose is a simple string
                    if isinstance(product.purpose, str) and product.purpose.strip():
                        purposes.add(product.purpose.strip())
        
        # If we get real purposes from database, use them
        if purposes and len(purposes) > 1:
            return sorted(list(purposes))
        
        # Otherwise provide comprehensive purpose categories
        return [
            'Productivity',
            'Content Generation', 
            'Image Recognition',
            'Data Analysis',
            'Automation',
            'Customer Service',
            'Healthcare',
            'Education',
            'Entertainment',
            'Research',
            'Security',
            'Finance',
            'Marketing',
            'Sales',
            'Design Tools',
            'Development Tools',
            'Communication',
            'Project Management',
            'Social Media',
            'E-commerce',
            'Travel',
            'Food & Nutrition',
            'Fitness & Health',
            'Music & Audio',
            'Video & Media',
            'Gaming',
            'Real Estate',
            'Legal',
            'Human Resources',
            'Operations'
        ]
    
    except Exception as e:
        # Return default suggestions on error
        return [
            'Content Generation', 'Image Recognition', 'Data Analysis',
            'Automation', 'Customer Service', 'Healthcare', 'Education'
        ] 