import requests
import json

def test_api():
    # Test technologies
    print("🔧 Testing technology suggestions...")
    resp = requests.get('http://localhost:8000/api/suggestions/technologies')
    if resp.status_code == 200:
        techs = resp.json()[:5]
        print(f"✅ Got {len(techs)} technologies: {techs}")
    else:
        print(f"❌ Error: {resp.status_code}")
    
    # Test products with images
    print("\n🖼️  Testing product images...")
    resp = requests.get('http://localhost:8000/api/products?page=1&limit=3')
    if resp.status_code == 200:
        products = resp.json()['items']
        for i, product in enumerate(products[:3]):
            print(f"Product {i+1}: {product['name'][:30]}...")
            print(f"  Technologies: {product['technology']}")
            print(f"  Images: {len(product['image_urls'])} images")
            if product['image_urls']:
                print(f"  First image: {product['image_urls'][0][:60]}...")
            print()
    else:
        print(f"❌ Error: {resp.status_code}")

if __name__ == "__main__":
    test_api() 