#!/usr/bin/env python3
"""
STEP-BY-STEP DEBUG Migration Script  
"""

import sys
import os
import pandas as pd
import sqlite3
from datetime import datetime
import json
import numpy as np
import glob
from pathlib import Path

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.db.database import get_db_connection

def load_all_incidents():
    """Load ALL 346 AIAAIC incidents from complete data file with ABSOLUTE paths"""
    print("🚨 Loading ALL AIAAIC incidents...")
    
    # Use absolute path construction
    current_dir = os.path.dirname(os.path.abspath(__file__))
    incidents_path = os.path.join(current_dir, "..", "PRISM", "AgentX-feature-AIEthics", "AIAAIC-ProductHunt-Results", "AIAAIC_all_incidents_complete_data.csv")
    
    if not os.path.exists(incidents_path):
        print(f"   ❌ Complete incidents file not found")
        return None
    
    try:
        df = pd.read_csv(incidents_path)
        print(f"   📁 Raw incidents loaded: {len(df)}")
        
        # Remove duplicates by incident description - using CORRECT column name
        initial_count = len(df)
        df = df.drop_duplicates(subset=['Incident'], keep='first')
        
        final_count = len(df)
        print(f"   📊 Raw total: {initial_count}, After dedup: {final_count}")
        print(f"   ✅ Unique incidents loaded: {final_count}")
        return df
    except Exception as e:
        print(f"   ❌ Error loading incidents: {e}")
        return None

def load_correct_mappings():
    """Load the 2,081 correct AIAAIC x ProductHunt mappings with ABSOLUTE paths"""
    print("🔗 Loading correct incident-product mappings...")
    
    # Use absolute path construction
    current_dir = os.path.dirname(os.path.abspath(__file__))
    mappings_path = os.path.join(current_dir, "..", "PRISM", "AgentX-feature-AIEthics", "AIAAIC-ProductHunt-Results", "AIAAIC_ProductHunt_mapping_text_and_image_correct.csv")
    
    if not os.path.exists(mappings_path):
        print(f"   ❌ Correct mappings file not found")
        return None
    
    try:
        df = pd.read_csv(mappings_path)
        print(f"   📁 Raw mappings loaded: {len(df)}")
        print(f"   ✅ Loaded {len(df)} correct incident-product mappings")
        return df
    except Exception as e:
        print(f"   ❌ Error loading mappings: {e}")
        return None

def map_to_risk_domain(system_name, incident_desc):
    """Map system/incident to risk domain based on content analysis"""
    text = f"{system_name} {incident_desc}".lower()
    
    # Enhanced domain mapping based on research categories
    if any(keyword in text for keyword in ['bias', 'discrimination', 'fairness', 'ethical', 'rights']):
        return 'Ethics'
    elif any(keyword in text for keyword in ['privacy', 'data', 'personal', 'tracking', 'surveillance']):
        return 'Privacy'  
    elif any(keyword in text for keyword in ['security', 'hack', 'breach', 'attack', 'fraud']):
        return 'Security'
    elif any(keyword in text for keyword in ['safety', 'harm', 'dangerous', 'medical', 'health']):
        return 'Safety'
    else:
        return 'Safety'  # Default

def determine_risk_level_from_incident(incident_desc):
    """Determine risk level based on incident severity indicators"""
    text = incident_desc.lower()
    
    # High risk indicators
    high_risk_keywords = ['death', 'fatal', 'serious harm', 'medical', 'autonomous', 'critical', 'severe']
    if any(keyword in text for keyword in high_risk_keywords):
        return 'high'
    
    # Low risk indicators  
    low_risk_keywords = ['minor', 'cosmetic', 'aesthetic', 'entertainment', 'game']
    if any(keyword in text for keyword in low_risk_keywords):
        return 'low'
    
    return 'medium'  # Default

def debug_migrate_incidents():
    """Debug version of incident migration"""
    print("🚨 DEBUG: Migrating incidents...")
    
    # Load incidents
    all_incidents = load_all_incidents()
    if all_incidents is None:
        print("❌ Failed to load incident data")
        return {}
    
    # Get database connection
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print(f"📊 Processing {len(all_incidents)} incidents...")
    incidents_map = {}
    processed_count = 0
    
    for idx, row in all_incidents.iterrows():
        try:
            # Use CORRECT column names from incidents CSV: 'Incident' for description
            incident_desc = str(row.get('Incident', '')).strip()
            if not incident_desc or incident_desc == 'nan':
                print(f"   ⚠️  Skipping row {idx}: empty incident description")
                continue
            
            # Use CORRECT column name: 'System Name' 
            system_name = str(row.get('System Name', '')).strip()
            if system_name == 'nan':
                system_name = 'Unknown System'
            
            print(f"   📊 Processing incident {processed_count + 1}: {system_name[:50]}...")
            
            # Create default PRISM scores (6 dimensions)
            default_prism_scores = {
                'logical_coherence': 3,
                'factual_accuracy': 3,
                'practical_implementability': 3,
                'contextual_relevance': 3,
                'impact': 3,
                'exploitability': 3
            }
            
            # Extract other relevant data
            risk_domain = map_to_risk_domain(system_name, incident_desc)
            risk_level = determine_risk_level_from_incident(incident_desc)
            
            # Insert incident
            cursor.execute("""
                INSERT INTO incidents (
                    title, description, system_name, technologies, risk_level, risk_domain, 
                    impact_scale, confidence_score, prism_scores, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                system_name,  # title
                incident_desc,  # description
                system_name,  # system_name
                json.dumps(['AI System']),  # technologies
                risk_level,
                risk_domain,
                default_prism_scores['impact'],  # Single impact score
                0.8,  # confidence_score
                json.dumps(default_prism_scores),
                datetime.now().isoformat(),
                datetime.now().isoformat()
            ))
            
            incidents_map[incident_desc] = cursor.lastrowid
            processed_count += 1
            
            if processed_count % 10 == 0:
                print(f"   📊 Processed {processed_count} incidents...")
                
        except Exception as e:
            print(f"   ❌ Error processing incident {idx}: {e}")
            import traceback
            traceback.print_exc()
            continue
    
    # Commit changes
    conn.commit()
    conn.close()
    
    print(f"   ✅ Incidents created: {len(incidents_map)}")
    return incidents_map

def main():
    """Debug main function"""
    print("🚀 DEBUG: Step-by-step incident migration...")
    
    incidents_map = debug_migrate_incidents()
    print(f"✅ Final result: {len(incidents_map)} incidents in map")

if __name__ == "__main__":
    main() 