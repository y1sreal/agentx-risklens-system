# PRISM Integration Guide

## Overview

This guide explains how to set up and use the PRISM (Product Risk Incident Similarity Mapping) system with real data and scoring logic, replacing the previous mock implementations.

## What's New

### 🔬 **Real PRISM Data Integration**
- **4,518 real AI incidents** from AIAAIC database
- **Actual PRISM scores** calculated from research data
- **Real product mappings** from ProductHunt analysis
- **Validated transferability assessments** 

### 🧮 **Authentic PRISM Scoring Logic**
- **6 PRISM dimensions**: Logical Coherence, Factual Accuracy, Practical Implementability, Contextual Relevance, Uniqueness, Impact Scale
- **Technology-aware matching** using weighted similarity
- **Domain-specific scoring** for different application areas
- **ML-powered text similarity** using TF-IDF and cosine similarity

### 🔗 **Enhanced Backend API**
- Real-time PRISM score calculation
- Batch processing for multiple incidents
- Transferability ranking and filtering
- Detailed explanations for each score

## Quick Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- Git

### Automated Setup
```bash
# Run the automated setup script
python setup_prism.py
```

This will:
1. ✅ Verify PRISM data files
2. ✅ Install backend dependencies  
3. ✅ Migrate real data to database
4. ✅ Install frontend dependencies
5. ✅ Configure API endpoints

### Manual Setup

#### 1. Backend Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run database migration
python ../database_migration.py

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

## PRISM Data Structure

### Incident Data
```json
{
  "id": 1,
  "title": "Character AI chatbot incident", 
  "description": "AI chatbot suggesting harmful responses...",
  "technologies": ["Chatbot", "Machine learning"],
  "risk_level": "high",
  "risk_domain": "Safety",
  "impact_scale": 0.75,
  "confidence_score": 0.82,
  "prism_scores": {
    "logical_coherence": 0.85,
    "factual_accuracy": 0.78,
    "practical_implementability": 0.90,
    "contextual_relevance": 0.82,
    "uniqueness": 0.65,
    "impact_scale": 0.75
  }
}
```

### Product Data
```json
{
  "id": 1,
  "name": "ArtHeart.ai",
  "description": "AI character platform with lifelike personalities...",
  "technology": ["Chatbot", "Generative AI"],
  "purpose": ["AI Companion", "Entertainment"]
}
```

## API Endpoints

### Core PRISM Endpoints

#### Calculate PRISM Scores
```http
POST /api/incidents/prism-score/{incident_id}/{product_id}
```

**Response:**
```json
{
  "incident_id": 1,
  "product_id": 2,
  "prism_scores": {
    "logical_coherence": 0.85,
    "factual_accuracy": 0.78,
    "practical_implementability": 0.90,
    "contextual_relevance": 0.82,
    "uniqueness": 0.65,
    "impact_scale": 0.75
  },
  "transferability_score": 0.79,
  "explanation": "✓ Strong technology alignment...",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Batch PRISM Analysis
```http
GET /api/incidents/prism-batch/{product_id}?limit=10
```

**Response:**
```json
{
  "product_id": 1,
  "product_name": "ArtHeart.ai",
  "total_incidents": 10,
  "results": [
    {
      "incident": {
        "id": 5,
        "title": "Character AI suicide incident",
        "risk_level": "high",
        "risk_domain": "Safety"
      },
      "prism_scores": {...},
      "transferability_score": 0.89
    }
  ]
}
```

## PRISM Scoring Algorithm

### 1. **Logical Coherence (Tech)**
- **Purpose**: Measures technology alignment between incident and product
- **Method**: Jaccard similarity + weighted technology matching
- **Weights**: Generative AI (0.20), Machine Learning (0.18), Chatbot (0.15)

### 2. **Factual Accuracy (Tech)**  
- **Purpose**: Assesses technical compatibility through description similarity
- **Method**: TF-IDF vectorization + cosine similarity
- **Fallback**: Word overlap analysis

### 3. **Practical Implementability (User)**
- **Purpose**: Evaluates user context and use case similarity  
- **Method**: Domain alignment scoring + purpose matching
- **Domains**: Safety (0.9), Privacy (0.85), Ethics (0.8)

### 4. **Contextual Relevance (App Domain)**
- **Purpose**: Measures application domain relevance
- **Method**: Keyword matching against domain categories
- **Categories**: Safety, Ethics, Privacy, Security

### 5. **Uniqueness**
- **Purpose**: Assesses incident novelty and frequency
- **Method**: Risk level mapping + historical analysis
- **Scale**: High risk = 0.8, Medium = 0.5, Low = 0.3

### 6. **Impact Scale**
- **Purpose**: Quantifies potential transfer impact
- **Method**: Multi-scale impact assessment
- **Levels**: Individual, Group/Community, Societal/Global

## Frontend Integration

### New Components
- **Real PRISM Score Display**: Shows actual calculated scores
- **Transferability Ranking**: Orders incidents by real scores  
- **Technology Matching**: Visual technology overlap indicators
- **Domain Analysis**: Domain-specific risk assessments
- **Impact Visualization**: Multi-scale impact displays

### Updated Services
- **Real API Integration**: Connects to actual PRISM endpoints
- **Score Explanation**: Displays algorithm reasoning
- **Batch Processing**: Handles multiple incident analysis
- **Historical Data**: Shows real incident trends

## Development

### Adding New PRISM Logic
1. Update `backend/app/services/prism_service.py`
2. Add new scoring dimensions or weights
3. Test with real data in `database_migration.py`
4. Update API endpoints in `incidents.py`

### Extending Data Sources
1. Add new CSV files to PRISM folder
2. Update migration script parsing logic
3. Modify database schema if needed
4. Test data integrity

### Customizing Scoring
```python
# In prism_service.py
self.technology_weights = {
    'Chatbot': 0.15,
    'Generative AI': 0.20,
    'Machine learning': 0.18,
    # Add your technology weights
}
```

## Troubleshooting

### Database Issues
```bash
# Reset database
rm backend/app.db
python database_migration.py
```

### Missing Data
```bash
# Verify PRISM files
ls PRISM/AgentX-feature-AIEthics/
# Should show: AIAAIC_ProdHunt_IRR_100.csv
```

### API Errors
```bash
# Check backend logs
cd backend
uvicorn app.main:app --reload --log-level debug
```

### Frontend Issues
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

## Performance

### Database Optimization
- **Indexed fields**: risk_domain, risk_level, technologies
- **JSON optimization**: PRISM scores stored as optimized JSON
- **Query caching**: Frequent queries cached for performance

### Scoring Performance
- **Vectorization**: TF-IDF computed once per session
- **Batch processing**: Multiple incidents processed efficiently  
- **Similarity caching**: Technology similarities cached

## Security & Privacy

### Data Protection
- **Local storage**: All data processed locally
- **No external APIs**: PRISM scoring runs offline
- **User privacy**: No personal data transmitted
- **Secure defaults**: Conservative scoring fallbacks

## Contributing

### Adding New Incidents
1. Add to PRISM CSV files
2. Run migration script
3. Verify data quality
4. Test PRISM scoring

### Improving Algorithms
1. Update scoring logic
2. Test with real data
3. Validate results  
4. Update documentation

## Support

- **Documentation**: This file + inline code comments
- **API Docs**: http://localhost:8000/docs  
- **Test Data**: Available in PRISM folder
- **Examples**: Real incident-product pairs included

---

**Next Steps**: Run `python setup_prism.py` to get started with real PRISM data and scoring! 