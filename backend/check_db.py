import sqlite3

def check_database():
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    
    # First, check what tables exist
    print("=== ALL TABLES IN DATABASE ===")
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    for table in tables:
        print(f"Table: {table[0]}")
    
    if not tables:
        print("No tables found in database!")
        conn.close()
        return
    
    # Check products table schema if it exists
    table_names = [table[0] for table in tables]
    if 'products' in table_names:
        print("\n=== PRODUCTS TABLE SCHEMA ===")
        cursor.execute("PRAGMA table_info(products)")
        for row in cursor.fetchall():
            print(f"Column: {row[1]}, Type: {row[2]}, Not Null: {row[3]}, Default: {row[4]}")
        
        # Check if products table has data
        print("\n=== PRODUCTS TABLE COUNT ===")
        cursor.execute("SELECT COUNT(*) FROM products")
        count = cursor.fetchone()[0]
        print(f"Total products: {count}")
        
        # Check a few sample products to see if image_urls are populated
        if count > 0:
            print("\n=== SAMPLE PRODUCTS ===")
            cursor.execute("SELECT id, name, image_urls, product_url FROM products LIMIT 5")
            for row in cursor.fetchall():
                print(f"ID: {row[0]}, Name: {row[1]}")
                print(f"  Image URLs: {row[2]}")
                print(f"  Product URL: {row[3]}")
                print()
    else:
        print("\nProducts table does not exist!")
    
    # Check incidents table schema if it exists
    if 'incidents' in table_names:
        print("\n=== INCIDENTS TABLE SCHEMA ===")
        cursor.execute("PRAGMA table_info(incidents)")
        for row in cursor.fetchall():
            print(f"Column: {row[1]}, Type: {row[2]}, Not Null: {row[3]}, Default: {row[4]}")
        
        # Check incidents count
        print("\n=== INCIDENTS TABLE COUNT ===")
        cursor.execute("SELECT COUNT(*) FROM incidents")
        incident_count = cursor.fetchone()[0]
        print(f"Total incidents: {incident_count}")
    else:
        print("\nIncidents table does not exist!")
    
    conn.close()

if __name__ == "__main__":
    check_database() 