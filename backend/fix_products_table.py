import sqlite3
import os

def fix_products_table():
    """Fix the products table to include image_urls and product_url columns"""
    
    print("🔧 Fixing products table schema...")
    
    # Connect to database
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    
    # Check current schema
    print("\n📋 Current products table schema:")
    cursor.execute("PRAGMA table_info(products)")
    current_columns = []
    for row in cursor.fetchall():
        print(f"  - {row[1]} ({row[2]})")
        current_columns.append(row[1])
    
    # Check if we need to add columns
    missing_columns = []
    if 'image_urls' not in current_columns:
        missing_columns.append('image_urls')
    if 'product_url' not in current_columns:
        missing_columns.append('product_url')
    
    if not missing_columns:
        print("✅ Products table already has all required columns!")
        conn.close()
        return True
    
    print(f"\n❗ Missing columns: {', '.join(missing_columns)}")
    print("🗑️  Dropping existing products table...")
    
    # Drop the products table (this will also remove any data)
    cursor.execute("DROP TABLE IF EXISTS products")
    
    # Recreate with correct schema
    print("🏗️  Creating products table with correct schema...")
    cursor.execute("""
        CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            technology TEXT,  -- JSON array
            purpose TEXT,     -- JSON array  
            image_urls TEXT,  -- JSON array of image URLs
            product_url TEXT, -- ProductHunt URL
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)
    
    # Verify new schema
    print("\n✅ New products table schema:")
    cursor.execute("PRAGMA table_info(products)")
    for row in cursor.fetchall():
        print(f"  - {row[1]} ({row[2]})")
    
    # Commit changes
    conn.commit()
    conn.close()
    
    print("\n🎉 Products table fixed! You can now run the comprehensive migration.")
    return True

if __name__ == "__main__":
    fix_products_table() 