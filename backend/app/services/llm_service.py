from typing import Dict, List
import openai
from app.core.config import settings

async def predict_indices(description: str) -> Dict[str, List[str]]:
    """
    Use LLM to predict technology, purpose, and ethical issues from product description.
    """
    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert at analyzing AI products and identifying their key components.
                    For a given product description, identify:
                    1. Technologies used (e.g., LLM, Computer Vision, NLP)
                    2. Purposes (e.g., Customer Service, Healthcare, Education)
                    3. Potential ethical issues (e.g., Privacy, Bias, Transparency)
                    
                    Return the results in a structured format."""
                },
                {
                    "role": "user",
                    "content": f"Analyze this AI product description and identify technologies, purposes, and ethical issues:\n\n{description}"
                }
            ],
            temperature=0.3,
            max_tokens=500
        )

        # Parse the response and extract the predictions
        content = response.choices[0].message.content
        
        # Simple parsing - in production, you'd want more robust parsing
        lines = content.split('\n')
        predictions = {
            'technology': [],
            'purpose': [],
            'ethical_issues': []
        }
        
        current_section = None
        for line in lines:
            line = line.strip().lower()
            if 'technolog' in line:
                current_section = 'technology'
            elif 'purpose' in line:
                current_section = 'purpose'
            elif 'ethic' in line:
                current_section = 'ethical_issues'
            elif line and current_section and not line.startswith(('1.', '2.', '3.')):
                predictions[current_section].append(line.strip())

        return predictions

    except Exception as e:
        print(f"Error in predict_indices: {str(e)}")
        # Return empty predictions in case of error
        return {
            'technology': [],
            'purpose': [],
            'ethical_issues': []
        } 