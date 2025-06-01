import requests
import json

def test_similarity_api():
    """Test the similar incidents API with real data"""
    
    # Get first product
    print("🔍 Getting first product...")
    response = requests.get('http://localhost:8000/api/products?page=1&limit=1')
    if response.status_code != 200:
        print(f"❌ Failed to get products: {response.status_code}")
        return
    
    products_data = response.json()
    if not products_data['items']:
        print("❌ No products found")
        return
    
    product = products_data['items'][0]
    product_id = product['id']
    print(f"✅ Found product: {product['name']} (ID: {product_id})")
    print(f"   Technologies: {product['technology']}")
    print(f"   Purpose: {product['purpose']}")
    
    # Test similar incidents endpoint
    print(f"\n🔎 Testing incidents for product {product_id}...")
    response = requests.get(f'http://localhost:8000/api/products/{product_id}/incidents')
    
    if response.status_code == 200:
        incidents = response.json()
        print(f"✅ Found {len(incidents)} incidents:")
        
        for i, incident in enumerate(incidents):
            print(f"\n   Incident {i+1}: {incident['title']}")
            print(f"   Risk Level: {incident['risk_level']}")
            print(f"   Risk Domain: {incident['risk_domain']}")
            print(f"   Similarity Score: {incident.get('similarity_score', 'N/A'):.3f}")
            print(f"   Technologies: {incident['technologies']}")
            if incident.get('prism_scores'):
                scores = incident['prism_scores']
                print(f"   PRISM Scores: LC={scores['logical_coherence']:.1f}, FA={scores['factual_accuracy']:.1f}")
    else:
        print(f"❌ Error: {response.status_code}")
        print(f"   Response: {response.text}")

if __name__ == "__main__":
    test_similarity_api() 