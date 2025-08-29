import requests
import json

def test_ppt_upload_api():
    """Test the PPT upload API endpoints"""
    
    base_url = "http://localhost:8000"
    
    print("🧪 Testing PPT Upload API Endpoints")
    print("=" * 50)
    
    # Test 1: Get PPT report status
    print("\n1️⃣ Testing GET /api/ppt-report-status")
    try:
        response = requests.get(f"{base_url}/api/ppt-report-status")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("✅ Success! Response:")
            print(f"   Total documents: {data.get('total_documents', 'N/A')}")
            print(f"   Sheets: {data.get('sheet_counts', 'N/A')}")
            print(f"   Latest upload: {data.get('latest_upload', 'N/A')}")
        else:
            print(f"❌ Failed: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: Test file upload (without actual file)
    print("\n2️⃣ Testing POST /api/upload-ppt-report (without file)")
    try:
        response = requests.post(f"{base_url}/api/upload-ppt-report")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 422:  # Expected: validation error for missing file
            print("✅ Success! Correctly rejected request without file")
        else:
            print(f"❌ Unexpected response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 3: Test root endpoint
    print("\n3️⃣ Testing GET /")
    try:
        response = requests.get(f"{base_url}/")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("✅ Success! Backend is running")
            print(f"   Message: {data.get('message', 'N/A')}")
            print(f"   Version: {data.get('version', 'N/A')}")
        else:
            print(f"❌ Failed: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Test completed!")
    print("\nTo test file upload, you can:")
    print("1. Start the backend: uvicorn main:app --reload")
    print("2. Use the frontend dashboard to upload a file")
    print("3. Or use Postman/curl to test the API directly")

if __name__ == "__main__":
    test_ppt_upload_api()

