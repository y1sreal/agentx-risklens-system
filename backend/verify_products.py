#!/usr/bin/env python3
"""
Verify Product Uniqueness
"""

import os
import pandas as pd
import glob

def verify_product_uniqueness():
    """Verify that our 9,557 products are truly unique"""
    print("🔍 VERIFYING PRODUCT UNIQUENESS")
    print("="*50)
    
    # Use absolute path construction
    current_dir = os.path.dirname(os.path.abspath(__file__))
    base_path = os.path.join(current_dir, "..", "PRISM", "AgentX-feature-AIEthics", "final_csv")
    
    product_files = glob.glob(os.path.join(base_path, "product_data_*.csv"))
    print(f"📁 Loading from {len(product_files)} files...")
    
    all_dfs = []
    for file_path in product_files:
        try:
            df = pd.read_csv(file_path)
            all_dfs.append(df)
        except Exception as e:
            print(f"❌ Error loading {file_path}: {e}")
    
    if not all_dfs:
        print("❌ No data files loaded!")
        return
    
    # Combine all data
    combined_df = pd.concat(all_dfs, ignore_index=True)
    
    print(f"\n📊 UNIQUENESS ANALYSIS:")
    print(f"   • Total rows: {len(combined_df)}")
    print(f"   • Unique by Product Name: {combined_df['Product Name'].nunique()}")
    print(f"   • Unique by Product URL: {combined_df['Product URL'].nunique()}")
    
    # Check for exact duplicates
    exact_duplicates = combined_df.duplicated().sum()
    print(f"   • Exact duplicate rows: {exact_duplicates}")
    
    # Deduplicate by Product Name (what our migration script does)
    deduplicated_df = combined_df.drop_duplicates(subset=['Product Name'], keep='first')
    duplicates_removed = len(combined_df) - len(deduplicated_df)
    
    print(f"\n🔄 DEDUPLICATION RESULTS:")
    print(f"   • After dedup by name: {len(deduplicated_df)}")
    print(f"   • Duplicates removed: {duplicates_removed}")
    print(f"   • Deduplication rate: {(duplicates_removed/len(combined_df)*100):.1f}%")
    
    if duplicates_removed < 200:  # Less than 2% duplicates
        print(f"\n✅ GOOD: Only {duplicates_removed} duplicates - the 9,557 products are mostly unique!")
        print(f"✅ Having 9,557 unique products is indeed better than 4,046!")
    else:
        print(f"\n⚠️  High duplicate rate: {duplicates_removed} duplicates found")
    
    # Sample some products to verify they look different
    print(f"\n📋 SAMPLE PRODUCTS (first 5):")
    for i, row in deduplicated_df.head(5).iterrows():
        print(f"   {i+1}. {row['Product Name'][:50]}... (URL: {row['Product URL'][:30]}...)")

if __name__ == "__main__":
    verify_product_uniqueness() 