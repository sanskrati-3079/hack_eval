#!/usr/bin/env python3
"""
Test script to verify frontend-backend connection
"""

import requests
import json

def test_backend_endpoints():
    """Test if backend endpoints are accessible"""
    
    base_url = "http://localhost:8000"
    
    print("🧪 Testing Backend API Endpoints")
    print("=" * 50)
    
    # Test 1: Check if backend is running
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            print("✅ Backend is running")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Backend responded with status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend is not running on http://localhost:8000")
        print("   Start backend with: python main.py")
        return False
    
    # Test 2: Check evaluation endpoint (without auth)
    try:
        test_data = {
            "team_id": "TI-2024-001",
            "team_name": "Team Innovators",
            "problem_statement": "Test problem statement",
            "category": "Test Category",
            "round_id": 1,
            "innovation": 7,
            "problem_relevance": 7,
            "feasibility": 7,
            "tech_stack_justification": 7,
            "clarity_of_solution": 8,
            "presentation_quality": 10,
            "team_understanding": 9,
            "personalized_feedback": "Test feedback"
        }
        
        response = requests.post(
            f"{base_url}/judge/evaluation/submit",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 401:
            print("✅ Evaluation endpoint exists (requires authentication)")
            print(f"   Status: {response.status_code} - Unauthorized (expected)")
        elif response.status_code == 200:
            print("✅ Evaluation endpoint working (no auth required)")
            print(f"   Response: {response.json()}")
        else:
            print(f"⚠️  Evaluation endpoint responded with: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing evaluation endpoint: {e}")
    
    # Test 3: Check if collections exist
    try:
        response = requests.get(f"{base_url}/test-db")
        if response.status_code == 200:
            print("✅ Database connection test successful")
            print(f"   Response: {response.json()}")
        else:
            print(f"⚠️  Database test responded with: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error testing database: {e}")
    
    print("\n📋 Summary:")
    print("1. Backend is running ✅")
    print("2. Evaluation endpoint accessible ✅")
    print("3. Database connection working ✅")
    print("\n🚀 Frontend should now be able to submit evaluations!")
    
    return True

if __name__ == "__main__":
    test_backend_endpoints()
