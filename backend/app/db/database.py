"""
Database connection utilities for PRISM migration
"""

import sqlite3
import os
from pathlib import Path

def get_db_connection():
    """
    Get SQLite database connection for migration
    """
    # Database path relative to backend directory
    db_path = Path(__file__).parent.parent.parent / "app.db"
    
    # Ensure database directory exists
    db_path.parent.mkdir(exist_ok=True)
    
    return sqlite3.connect(str(db_path))

def get_db_path():
    """
    Get the database file path
    """
    return Path(__file__).parent.parent.parent / "app.db" 