#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import sqlite3
from app.api.endpoints.products import get_product_incidents
from app.api.deps import get_db
from sqlalchemy.orm import Session
import asyncio

async def test_endpoint():
    """Test the fixed products incidents endpoint"""
    
    # Check if database exists and has data
    if not os.path.exists('app.db'):
        print("❌ Database not found. Run migration first.")
        return
        
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    
    # Check product exists
    cursor.execute("SELECT id, name FROM products WHERE id = 47801")
    product = cursor.fetchone()
    if not product:
        cursor.execute("SELECT id, name FROM products LIMIT 1")
        product = cursor.fetchone()
        if not product:
            print("❌ No products found in database")
            return
        product_id = product[0]
        print(f"🔄 Using product ID {product_id} instead of 47801")
    else:
        product_id = 47801
        print(f"✅ Found product: {product[1]}")
    
    # Check incidents exist
    cursor.execute("SELECT COUNT(*) FROM incidents")
    incident_count = cursor.fetchone()[0]
    print(f"📊 Total incidents: {incident_count}")
    
    conn.close()
    
    if incident_count == 0:
        print("❌ No incidents found in database")
        return
    
    print(f"\n🧪 Testing endpoint: /api/products/{product_id}/incidents")
    
    try:
        # Mock the database session (this is simplified for testing)
        class MockDB:
            def query(self, model):
                import sqlite3
                conn = sqlite3.connect('app.db')
                cursor = conn.cursor()
                
                if 'Product' in str(model):
                    cursor.execute("SELECT id, name, description, technology, purpose FROM products WHERE id = ?", (product_id,))
                    row = cursor.fetchone()
                    if row:
                        class MockProduct:
                            def __init__(self, row):
                                self.id = row[0]
                                self.name = row[1] or ""
                                self.description = row[2] or ""
                                self.technology = row[3] or "[]"
                                self.purpose = row[4] or "[]"
                        return MockQuery(MockProduct(row))
                    return MockQuery(None)
                return MockQuery([])
                        
        class MockQuery:
            def __init__(self, result):
                self._result = result
                
            def filter(self, *args):
                return self
                
            def first(self):
                return self._result
        
        # Test the endpoint
        db = MockDB()
        
        # This would normally be called by FastAPI
        result = await get_product_incidents(
            product_id=product_id,
            db=db,
            limit=5
        )
        
        print("✅ Endpoint executed successfully!")
        print(f"📊 Response format: {type(result)}")
        print(f"🔢 Incidents returned: {result.get('total_incidents', 'N/A')}")
        
        if 'incidents' in result and result['incidents']:
            first_incident = result['incidents'][0]
            print(f"📋 First incident: {first_incident.get('title', 'N/A')[:50]}...")
            print(f"🎯 PRISM scores included: {bool(first_incident.get('prism_scores'))}")
        
    except Exception as e:
        print(f"❌ Error testing endpoint: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_endpoint()) 