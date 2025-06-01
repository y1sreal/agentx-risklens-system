from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import products, incidents, stats, suggestions, prism
from app.core.config import settings
from app.db.init_db import init_db

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# Include routers with correct prefix structure
# The frontend expects /api/* endpoints, not /api/v1/*
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(incidents.router, prefix="/api/incidents", tags=["incidents"])
app.include_router(stats.router, prefix="/api", tags=["stats"])
app.include_router(suggestions.router, prefix="/api", tags=["suggestions"])
app.include_router(prism.router, prefix="/api/prism", tags=["prism"])

@app.get("/")
def root():
    return {"message": "Welcome to AI Incident Transferability Forecasting API"} 