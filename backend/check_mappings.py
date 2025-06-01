import sqlite3

def check_mappings():
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    
    # Check total mappings
    cursor.execute('SELECT COUNT(*) FROM incident_product_mappings')
    total_mappings = cursor.fetchone()[0]
    print(f"Total mappings: {total_mappings}")
    
    # Check human-validated mappings
    cursor.execute('SELECT COUNT(*) FROM incident_product_mappings WHERE is_human_validated = 1')
    validated_mappings = cursor.fetchone()[0]
    print(f"Human-validated mappings: {validated_mappings}")
    
    # Sample some mappings
    cursor.execute("""
        SELECT m.id, i.title, p.name, m.mapping_confidence, m.is_human_validated
        FROM incident_product_mappings m
        JOIN incidents i ON m.incident_id = i.id
        JOIN products p ON m.product_id = p.id
        LIMIT 5
    """)
    print("\nSample mappings:")
    for row in cursor.fetchall():
        print(f"  ID: {row[0]}, Incident: {row[1][:50]}..., Product: {row[2][:30]}..., Confidence: {row[3]}, Validated: {row[4]}")
    
    conn.close()

if __name__ == "__main__":
    check_mappings() 