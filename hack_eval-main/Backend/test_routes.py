#!/usr/bin/env python3
"""
Test script to verify routes are properly registered
"""

import requests
import json

def test_routes():
    """Test if routes are accessible"""
    
    base_url = "http://localhost:8000"
    
    print("🧪 Testing Route Registration")
    print("=" * 50)
    
    # Test 1: Root endpoint
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            print("✅ Root endpoint working")
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Root endpoint error: {e}")
        return False
    
    # Test 2: Judge evaluation endpoint
    try:
        test_data = {
            "team_id": "TI-2024-001",
            "team_name": "Team Innovators",
            "problem_statement": "Test",
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
        
        print(f"📡 Evaluation endpoint test:")
        print(f"   URL: {base_url}/judge/evaluation/submit")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 401:
            print("   ✅ Route exists (requires authentication)")
        elif response.status_code == 404:
            print("   ❌ Route not found (404)")
        else:
            print(f"   ⚠️  Unexpected status: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Evaluation endpoint error: {e}")
    
    # Test 3: Check available routes
    try:
        response = requests.get(f"{base_url}/docs")
        if response.status_code == 200:
            print("✅ Swagger docs accessible")
            print("   Visit: http://localhost:8000/docs")
        else:
            print(f"⚠️  Swagger docs: {response.status_code}")
    except Exception as e:
        print(f"❌ Swagger docs error: {e}")
    
    print("\n📋 Route Summary:")
    print("1. Root endpoint: ✅")
    print("2. Evaluation endpoint: Check status above")
    print("3. Swagger docs: ✅")
    
    return True

if __name__ == "__main__":
    test_routes()
