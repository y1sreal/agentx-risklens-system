from sqlalchemy.orm import Session
from app.db.base_class import Base
from app.db.session import engine

def init_db() -> None:
    # Create tables
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    print("Creating initial database tables...")
    init_db()
    print("Database tables created successfully!") 