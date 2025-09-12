import pandas as pd
import os

def examine_excel_file(file_path):
    """Examine the structure of the Excel file"""
    try:
        print(f"🔍 Examining Excel file: {file_path}")
        print("=" * 60)
        
        # Check if file exists
        if not os.path.exists(file_path):
            print(f"❌ File not found: {file_path}")
            return False
        
        # Get file size
        file_size = os.path.getsize(file_path)
        print(f"📁 File size: {file_size:,} bytes ({file_size/1024:.2f} KB)")
        
        # Read Excel file
        excel_file = pd.ExcelFile(file_path)
        print(f"📊 Total sheets: {len(excel_file.sheet_names)}")
        print(f"📋 Sheet names: {excel_file.sheet_names}")
        print()
        
        # Examine each sheet
        for i, sheet_name in enumerate(excel_file.sheet_names, 1):
            print(f"📋 Sheet {i}: {sheet_name}")
            print("-" * 40)
            
            # Read the sheet
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            
            # Basic info
            print(f"   Rows: {len(df)}")
            print(f"   Columns: {len(df.columns)}")
            print(f"   Memory usage: {df.memory_usage(deep=True).sum() / 1024:.2f} KB")
            
            # Column info
            print(f"   Columns: {list(df.columns)}")
            
            # Data types
            print(f"   Data types:")
            for col, dtype in df.dtypes.items():
                print(f"     {col}: {dtype}")
            
            # Sample data (first 3 rows)
            print(f"   Sample data (first 3 rows):")
            print(df.head(3).to_string())
            
            # Check for NaN values
            nan_count = df.isna().sum().sum()
            print(f"   Total NaN values: {nan_count}")
            
            print()
        
        print("=" * 60)
        print("✅ File examination completed!")
        return True
        
    except Exception as e:
        print(f"❌ Error examining file: {e}")
        return False

def main():
    """Main function"""
    # File path
    excel_file_path = "PPt_Report.xlsx"
    
    # Check if file exists
    if not os.path.exists(excel_file_path):
        print(f"❌ Excel file not found: {excel_file_path}")
        print("Please make sure the file is in the same directory as this script")
        return
    
    # Examine the file
    success = examine_excel_file(excel_file_path)
    
    if success:
        print("\n📋 File structure analysis completed!")
        print("You can now run the main upload script: python upload_ppt_report.py")
    else:
        print("\n❌ File analysis failed!")

if __name__ == "__main__":
    main()

