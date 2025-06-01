#!/usr/bin/env python3
"""
Check PRISM Product Data Analysis
"""

import os
import pandas as pd
import glob
import json

def check_product_files():
    """Check all product data files and their contents"""
    print("🔍 ANALYZING PRODUCT DATA FILES")
    print("="*50)
    
    # Use absolute path construction
    current_dir = os.path.dirname(os.path.abspath(__file__))
    base_path = os.path.join(current_dir, "..", "PRISM", "AgentX-feature-AIEthics", "final_csv")
    
    product_files = glob.glob(os.path.join(base_path, "product_data_*.csv"))
    print(f"📁 Found {len(product_files)} product data files")
    
    total_products = 0
    file_details = []
    
    for file_path in product_files:
        try:
            df = pd.read_csv(file_path)
            filename = os.path.basename(file_path)
            file_details.append((filename, len(df)))
            total_products += len(df)
            print(f"   📄 {filename}: {len(df)} products")
        except Exception as e:
            print(f"   ❌ Error loading {file_path}: {e}")
    
    print(f"\n📊 SUMMARY:")
    print(f"   • Total files: {len(product_files)}")
    print(f"   • Raw total products: {total_products}")
    
    # Now check deduplication
    if product_files:
        print(f"\n🔄 TESTING DEDUPLICATION...")
        all_dfs = []
        for file_path in product_files:
            try:
                df = pd.read_csv(file_path)
                all_dfs.append(df)
            except:
                continue
        
        if all_dfs:
            combined_df = pd.concat(all_dfs, ignore_index=True)
            initial_count = len(combined_df)
            
            # Check if 'Product Name' column exists
            if 'Product Name' in combined_df.columns:
                deduplicated_df = combined_df.drop_duplicates(subset=['Product Name'], keep='first')
                final_count = len(deduplicated_df)
                print(f"   • Before dedup: {initial_count}")
                print(f"   • After dedup: {final_count}")
                print(f"   • Duplicates removed: {initial_count - final_count}")
                
                # Check for the main data file mentioned in meeting doc
                print(f"\n🎯 EXPECTED: 4,046 products (from meeting doc)")
                print(f"🎯 ACTUAL: {final_count} products")
                if final_count > 4046:
                    print(f"⚠️  We have {final_count - 4046} MORE products than expected!")
            else:
                print(f"   ❌ 'Product Name' column not found!")
                print(f"   🔍 Available columns: {list(combined_df.columns)}")

def check_image_files():
    """Check image data files"""
    print(f"\n🖼️  ANALYZING IMAGE DATA FILES")
    print("="*50)
    
    # Use absolute path construction
    current_dir = os.path.dirname(os.path.abspath(__file__))
    base_path = os.path.join(current_dir, "..", "PRISM", "AgentX-feature-AIEthics", "final_image_urls")
    
    print(f"📁 Looking in: {os.path.abspath(base_path)}")
    print(f"📁 Directory exists: {os.path.exists(base_path)}")
    
    if not os.path.exists(base_path):
        print("❌ Image directory not found!")
        return
    
    image_files = glob.glob(os.path.join(base_path, "*.csv"))
    print(f"📁 Found {len(image_files)} image files")
    
    total_image_entries = 0
    products_with_images = 0
    
    for file_path in image_files:
        try:
            df = pd.read_csv(file_path)
            filename = os.path.basename(file_path)
            total_image_entries += len(df)
            
            # Count products with actual image URLs
            if 'Image URLs' in df.columns:
                images_in_file = 0
                for _, row in df.iterrows():
                    image_urls_str = str(row.get('Image URLs', '[]'))
                    try:
                        if image_urls_str.startswith('[') and image_urls_str.endswith(']'):
                            image_urls = json.loads(image_urls_str)
                            if image_urls and len(image_urls) > 0:
                                images_in_file += 1
                        elif image_urls_str and image_urls_str != 'nan' and image_urls_str != '[]':
                            images_in_file += 1
                    except:
                        continue
                
                products_with_images += images_in_file
                print(f"   📄 {filename}: {len(df)} entries, {images_in_file} with images")
            else:
                print(f"   📄 {filename}: {len(df)} entries, NO 'Image URLs' column")
                print(f"      🔍 Columns: {list(df.columns)}")
                
        except Exception as e:
            print(f"   ❌ Error loading {file_path}: {e}")
    
    print(f"\n📊 IMAGE SUMMARY:")
    print(f"   • Total image files: {len(image_files)}")
    print(f"   • Total image entries: {total_image_entries}")
    print(f"   • Products with images: {products_with_images}")
    
    if products_with_images == 0:
        print("⚠️  NO PRODUCTS HAVE IMAGES - This explains the migration result!")

def check_ai_products_all_info():
    """Check if the main AI_products_all_info file exists (mentioned in meeting doc)"""
    print(f"\n🎯 CHECKING FOR MAIN DATA FILE (from meeting doc)")
    print("="*50)
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Check in results_files directory
    ai_products_path = os.path.join(current_dir, "..", "PRISM", "AgentX-feature-AIEthics", "results_files", "AI_products_all_info.csv")
    print(f"📁 Checking: {os.path.abspath(ai_products_path)}")
    print(f"📁 File exists: {os.path.exists(ai_products_path)}")
    
    if os.path.exists(ai_products_path):
        try:
            df = pd.read_csv(ai_products_path)
            print(f"✅ AI_products_all_info.csv found: {len(df)} products")
            print(f"🔍 Columns: {list(df.columns)}")
            print("🎯 This might be the CORRECT file to use (4,046 products expected)")
            return df
        except Exception as e:
            print(f"❌ Error loading AI_products_all_info.csv: {e}")
    else:
        print("❌ AI_products_all_info.csv not found in results_files")
    
    return None

def main():
    """Main analysis function"""
    print("🚀 PRISM DATA ANALYSIS")
    print("="*60)
    
    # Check product files currently being used
    check_product_files()
    
    # Check image files
    check_image_files()
    
    # Check for the main data file mentioned in meeting doc
    main_data_file = check_ai_products_all_info()
    
    print(f"\n💡 RECOMMENDATIONS:")
    print("="*30)
    if main_data_file is not None:
        print("1. ✅ Use AI_products_all_info.csv instead of product_data_*.csv files")
        print("2. 🔍 This should give us the expected 4,046 products")
    print("3. 🖼️  Fix image loading - currently 0 products have images")
    print("4. 🔄 Re-run migration with corrected data sources")

if __name__ == "__main__":
    main() 