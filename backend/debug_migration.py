#!/usr/bin/env python3
"""
DEBUG PRISM Data Migration Script  
Debug version to identify why incidents and mappings are not loading
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

def debug_load_incidents():
    """Debug version of incident loading"""
    print("🚨 DEBUG: Loading AIAAIC incidents...")
    
    # Use absolute path construction
    current_dir = os.path.dirname(os.path.abspath(__file__))
    incidents_path = os.path.join(current_dir, "..", "PRISM", "AgentX-feature-AIEthics", "AIAAIC-ProductHunt-Results", "AIAAIC_all_incidents_complete_data.csv")
    
    print(f"   📁 Looking for incidents at: {os.path.abspath(incidents_path)}")
    print(f"   📁 File exists: {os.path.exists(incidents_path)}")
    
    if not os.path.exists(incidents_path):
        print(f"   ❌ Complete incidents file not found")
        return None
    
    try:
        print("   📁 Reading CSV file...")
        df = pd.read_csv(incidents_path)
        print(f"   📁 Raw incidents loaded: {len(df)}")
        print(f"   🔍 Column names: {list(df.columns)}")
        print(f"   🔍 First few rows of 'Incident' column:")
        
        # Check the Incident column specifically
        if 'Incident' in df.columns:
            print(f"     - Sample incidents:")
            for i, incident in enumerate(df['Incident'].head(5)):
                print(f"       {i}: {str(incident)[:100]}...")
        else:
            print(f"     ❌ 'Incident' column not found!")
            
        # Remove duplicates by incident description - using CORRECT column name
        initial_count = len(df)
        print(f"   📊 Before dedup: {initial_count}")
        
        if 'Incident' in df.columns:
            df = df.drop_duplicates(subset=['Incident'], keep='first')
            final_count = len(df)
            print(f"   📊 After dedup: {final_count}")
        else:
            print(f"   ❌ Cannot deduplicate - 'Incident' column missing")
            
        return df
    except Exception as e:
        print(f"   ❌ Error loading incidents: {e}")
        import traceback
        traceback.print_exc()
        return None

def debug_load_mappings():
    """Debug version of mappings loading"""
    print("🔗 DEBUG: Loading incident-product mappings...")
    
    # Use absolute path construction
    current_dir = os.path.dirname(os.path.abspath(__file__))
    mappings_path = os.path.join(current_dir, "..", "PRISM", "AgentX-feature-AIEthics", "AIAAIC-ProductHunt-Results", "AIAAIC_ProductHunt_mapping_text_and_image_correct.csv")
    
    print(f"   📁 Looking for mappings at: {os.path.abspath(mappings_path)}")
    print(f"   📁 File exists: {os.path.exists(mappings_path)}")
    
    if not os.path.exists(mappings_path):
        print(f"   ❌ Correct mappings file not found")
        return None
    
    try:
        print("   📁 Reading CSV file...")
        df = pd.read_csv(mappings_path)
        print(f"   📁 Raw mappings loaded: {len(df)}")
        print(f"   🔍 Column names: {list(df.columns)}")
        
        # Check specific columns
        if 'Product Hunt Product' in df.columns:
            print(f"   ✅ 'Product Hunt Product' column found")
            print(f"     - Sample products: {list(df['Product Hunt Product'].head(3))}")
        else:
            print(f"   ❌ 'Product Hunt Product' column not found!")
            
        if 'Incident' in df.columns:
            print(f"   ✅ 'Incident' column found")
            print(f"     - Sample incidents:")
            for i, incident in enumerate(df['Incident'].head(3)):
                print(f"       {i}: {str(incident)[:100]}...")
        else:
            print(f"   ❌ 'Incident' column not found!")
            
        return df
    except Exception as e:
        print(f"   ❌ Error loading mappings: {e}")
        import traceback
        traceback.print_exc()
        return None

def main():
    """Debug main function"""
    print("🚀 DEBUG: Starting PRISM data investigation...")
    
    # Load and test incidents
    incidents = debug_load_incidents()
    if incidents is not None:
        print(f"✅ Incidents loaded successfully: {len(incidents)} rows")
    else:
        print(f"❌ Failed to load incidents")
    
    print("\n" + "="*50 + "\n")
    
    # Load and test mappings
    mappings = debug_load_mappings()
    if mappings is not None:
        print(f"✅ Mappings loaded successfully: {len(mappings)} rows")
    else:
        print(f"❌ Failed to load mappings")

if __name__ == "__main__":
    main() 