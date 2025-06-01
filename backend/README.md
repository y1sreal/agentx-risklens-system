# AI Incident Transferability Forecasting Backend

This is the backend service for the AI Incident Transferability Forecasting system. It provides API endpoints for managing AI products and predicting their technology, purpose, and ethical issues using LLM.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the root directory with the following variables:
```
OPENAI_API_KEY=your_openai_api_key
```

## Running the Server

Start the development server:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- Swagger UI documentation: `http://localhost:8000/docs`
- ReDoc documentation: `http://localhost:8000/redoc`

## API Endpoints

- `POST /api/v1/products/` - Create a new product and get predictions
- `GET /api/v1/products/` - List all products
- `GET /api/v1/products/{product_id}` - Get a specific product
- `PUT /api/v1/products/{product_id}` - Update a product
- `DELETE /api/v1/products/{product_id}` - Delete a product 