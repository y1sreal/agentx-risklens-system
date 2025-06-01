#!/usr/bin/env python3
"""
Database Migration Script for PRISM Data
Imports actual incident data and PRISM scores from CSV files into the database
"""

import sys
import os
import pandas as pd
import sqlite3
from datetime import datetime
import json
import numpy as np

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.db.database import get_db_connection

def clean_and_normalize_score(score_value, fallback=0.5):
    """Clean and normalize PRISM scores to 0-1 range"""
    if pd.isna(score_value) or score_value == '' or score_value == 'Match':
        return fallback
    
    try:
        # Convert to float
        score = float(score_value)
        # Normalize to 0-1 range (assuming scores are 1-5 scale)
        if score > 1:
            score = (score - 1) / 4  # Convert 1-5 to 0-1
        return max(0, min(1, score))  # Clamp to 0-1
    except (ValueError, TypeError):
        return fallback

def extract_technologies(tech_string):
    """Extract technology list from string"""
    if pd.isna(tech_string) or not tech_string:
        return []
    
    # Split by semicolons and clean
    techs = [tech.strip() for tech in str(tech_string).split(';')]
    return [tech for tech in techs if tech and tech != 'nan']

def map_app_domain_to_risk_domain(app_domain):
    """Map application domain to risk domain"""
    domain_mapping = {
        'art': 'Ethics',
        'companion': 'Safety', 
        'ai companion': 'Safety',
        'customization': 'Privacy',
        'healthcare': 'Safety',
        'finance': 'Security',
        'transportation': 'Safety',
        'education': 'Ethics',
        'entertainment': 'Ethics'
    }
    
    if pd.isna(app_domain):
        return 'Safety'
    
    return domain_mapping.get(str(app_domain).lower(), 'Safety')

def determine_risk_level(impact_scores):
    """Determine risk level based on impact scores"""
    avg_impact = np.mean([score for score in impact_scores if score > 0])
    
    if avg_impact >= 0.7:
        return 'high'
    elif avg_impact >= 0.4:
        return 'medium'
    else:
        return 'low'

def migrate_prism_data():
    """Main migration function"""
    print("Starting PRISM data migration...")
    
    # Load the PRISM data
    prism_data_path = "PRISM/AgentX-feature-AIEthics/AIAAIC_ProdHunt_IRR_100.csv"
    
    if not os.path.exists(prism_data_path):
        print(f"Error: PRISM data file not found at {prism_data_path}")
        return False
    
    print(f"Loading PRISM data from {prism_data_path}")
    df = pd.read_csv(prism_data_path)
    
    print(f"Loaded {len(df)} rows of PRISM data")
    
    # Get database connection
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create tables if they don't exist
    create_tables(cursor)
    
    # Clear existing data
    print("Clearing existing data...")
    cursor.execute("DELETE FROM incidents")
    cursor.execute("DELETE FROM products") 
    cursor.execute("DELETE FROM feedback")
    
    # Track unique products and incidents
    products_map = {}
    incident_id = 1
    product_id = 1
    
    print("Processing PRISM data...")
    
    for idx, row in df.iterrows():
        try:
            # Extract product information
            product_name = str(row['Product Hunt Product']).strip()
            product_description = str(row['Product Hunt Product Description']).strip()
            
            if product_name == 'nan' or not product_name:
                continue
                
            # Check if product already exists
            if product_name not in products_map:
                # Extract technologies from the original system
                original_system = str(row['Original Incident System'])
                tech_description = str(row['Original System Description'])
                
                # Basic technology extraction (you can enhance this)
                technologies = extract_technologies(original_system)
                if not technologies:
                    technologies = ['AI System']  # Default fallback
                
                # Extract purpose from description
                purposes = [row['App Domain'] if not pd.isna(row['App Domain']) else 'General AI']
                
                # Insert product
                cursor.execute("""
                    INSERT INTO products (id, name, description, technology, purpose, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    product_id,
                    product_name,
                    product_description,
                    json.dumps(technologies),
                    json.dumps(purposes),
                    datetime.now().isoformat(),
                    datetime.now().isoformat()
                ))
                
                products_map[product_name] = product_id
                product_id += 1
            
            # Extract incident information
            incident_title = str(row['Original Incident System']).strip()
            incident_description = str(row['Incident Des']).strip()
            
            if incident_description == 'nan' or not incident_description:
                continue
            
            # Extract PRISM scores
            logical_coherence = clean_and_normalize_score(row.get('Logical coherence [Tech]', 0.5))
            factual_accuracy = clean_and_normalize_score(row.get('Factual accuracy [Tech]', 0.5))
            practical_implementability = clean_and_normalize_score(row.get('Practical implementability [User]', 0.5))
            contextual_relevance = clean_and_normalize_score(row.get('Contextual relevance [app domain]', 0.5))
            uniqueness = clean_and_normalize_score(row.get('Uniqueness (referring to the frequency)', 0.5))
            
            # Impact scores
            impact_individual = clean_and_normalize_score(row.get('Impact (IMP) - Individual scale', 0.3))
            impact_group = clean_and_normalize_score(row.get('Impact (IMP) - group/ community scale', 0.3))
            impact_societal = clean_and_normalize_score(row.get('Impact (IMP) - societal/ global scale', 0.3))
            
            # Calculate overall impact scale
            impact_scale = (impact_individual + impact_group + impact_societal) / 3
            
            # Determine risk level
            risk_level = determine_risk_level([impact_individual, impact_group, impact_societal])
            risk_domain = map_app_domain_to_risk_domain(row.get('App Domain'))
            
            # Extract technologies for incident
            incident_technologies = extract_technologies(original_system)
            
            # Calculate confidence score (based on data quality)
            confidence_score = (logical_coherence + factual_accuracy) / 2
            
            # Insert incident
            cursor.execute("""
                INSERT INTO incidents (
                    id, title, description, technologies, risk_level, risk_domain,
                    impact_scale, confidence_score, prism_scores, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                incident_id,
                incident_title,
                incident_description,
                json.dumps(incident_technologies),
                risk_level,
                risk_domain,
                impact_scale,
                confidence_score,
                json.dumps({
                    'logical_coherence': logical_coherence,
                    'factual_accuracy': factual_accuracy,
                    'practical_implementability': practical_implementability,
                    'contextual_relevance': contextual_relevance,
                    'uniqueness': uniqueness,
                    'impact_scale': impact_scale
                }),
                datetime.now().isoformat(),
                datetime.now().isoformat()
            ))
            
            incident_id += 1
            
            if idx % 100 == 0:
                print(f"Processed {idx} rows...")
                
        except Exception as e:
            print(f"Error processing row {idx}: {e}")
            continue
    
    # Commit changes
    conn.commit()
    conn.close()
    
    print(f"Migration completed! Imported {len(products_map)} products and {incident_id-1} incidents")
    return True

def create_tables(cursor):
    """Create database tables"""
    
    # Products table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            technology TEXT,  -- JSON array
            purpose TEXT,     -- JSON array  
            created_at TEXT,
            updated_at TEXT
        )
    """)
    
    # Incidents table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS incidents (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            technologies TEXT, -- JSON array
            risk_level TEXT,
            risk_domain TEXT,
            impact_scale REAL,
            confidence_score REAL,
            prism_scores TEXT, -- JSON object
            created_at TEXT,
            updated_at TEXT
        )
    """)
    
    # Feedback table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            incident_id INTEGER,
            user_comment TEXT,
            relevance INTEGER,
            prism_scores TEXT, -- JSON object
            created_at TEXT,
            FOREIGN KEY (incident_id) REFERENCES incidents (id)
        )
    """)

if __name__ == "__main__":
    success = migrate_prism_data()
    if success:
        print("PRISM data migration completed successfully!")
    else:
        print("PRISM data migration failed!")
        sys.exit(1) 