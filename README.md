# AgentX - AI Incident Transferability Forecasting System

A human-in-the-loop system for forecasting AI incident transferability, where users interactively evaluate system-recommended incidents and contribute new hypothetical risks.

## Project Structure

```
agentx/
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── api/      # API routes
│   │   ├── core/     # Core functionality
│   │   ├── models/   # Database models
│   │   └── services/ # Business logic
│   └── tests/        # Backend tests
├── frontend/         # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   └── public/
└── docs/            # Documentation
```

## Setup Instructions

### Backend Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the backend:
```bash
cd backend
uvicorn app.main:app --reload
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run the development server:
```bash
npm run dev
```

## Features

- Product input and analysis
- Incident retrieval and recommendation
- Three modes of PRISM-based incident display
- Human-in-the-loop feedback system
- Version tracking and archive system

## Development

- Backend API runs on http://localhost:8000
- Frontend development server runs on http://localhost:3000
- API documentation available at http://localhost:8000/docs 