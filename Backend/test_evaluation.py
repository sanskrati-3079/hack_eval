#!/usr/bin/env python3
"""
Test script for the Judge Evaluation System
This script demonstrates how to use the evaluation API endpoints
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
JUDGE_TOKEN = "your_judge_jwt_token_here"  # Replace with actual token

# Headers for authenticated requests
headers = {
    "Authorization": f"Bearer {JUDGE_TOKEN}",
    "Content-Type": "application/json"
}

def test_submit_evaluation():
    """Test submitting a complete evaluation"""
    
    evaluation_data = {
        "team_id": "TI-2024-001",
        "team_name": "Team Innovators",
        "problem_statement": "Develop a sustainable solution for smart waste management in urban areas using IoT and AI technologies to optimize collection routes and reduce environmental impact.",
        "category": "Smart Cities",
        "round_id": 1,
        "innovation": 8.5,
        "problem_relevance": 9.0,
        "feasibility": 7.5,
        "tech_stack_justification": 8.0,
        "clarity_of_solution": 8.5,
        "presentation_quality": 9.0,
        "team_understanding": 8.0,
        "personalized_feedback": "Excellent solution with innovative approach to waste management. The IoT integration and AI algorithms show strong technical understanding. Consider adding more details on cost-benefit analysis and scalability metrics."
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/judge/evaluation/submit",
            headers=headers,
            json=evaluation_data
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Evaluation submitted successfully!")
            print(f"Evaluation ID: {result['evaluation_id']}")
            print(f"Total Score: {result['total_score']}")
            print(f"Average Score: {result['average_score']}")
        else:
            print(f"❌ Failed to submit evaluation: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_save_draft():
    """Test saving evaluation as draft"""
    
    draft_data = {
        "team_id": "TI-2024-002",
        "team_name": "Team Pioneers",
        "problem_statement": "Create an AI-powered educational platform for personalized learning experiences.",
        "category": "Education Technology",
        "round_id": 1,
        "innovation": 7.0,
        "problem_relevance": 8.5,
        "feasibility": 6.5,
        "tech_stack_justification": 7.5,
        "clarity_of_solution": 8.0,
        "presentation_quality": 7.5,
        "team_understanding": 7.0,
        "personalized_feedback": "Good concept but needs more technical details and implementation roadmap."
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/judge/evaluation/save-draft",
            headers=headers,
            json=draft_data
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Draft saved successfully!")
            print(f"Draft ID: {result['evaluation_id']}")
        else:
            print(f"❌ Failed to save draft: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_get_my_evaluations():
    """Test retrieving judge's evaluations"""
    
    try:
        response = requests.get(
            f"{BASE_URL}/judge/evaluation/my-evaluations",
            headers=headers
        )
        
        if response.status_code == 200:
            evaluations = response.json()
            print(f"✅ Retrieved {len(evaluations)} evaluations:")
            
            for eval in evaluations:
                print(f"\n- Team: {eval['team_name']}")
                print(f"  Score: {eval['total_score']}/70")
                print(f"  Status: {eval['evaluation_status']}")
                print(f"  Date: {eval['evaluated_at']}")
        else:
            print(f"❌ Failed to get evaluations: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_get_team_evaluation():
    """Test getting evaluation for a specific team"""
    
    team_id = "TI-2024-001"
    
    try:
        response = requests.get(
            f"{BASE_URL}/judge/evaluation/team/{team_id}",
            headers=headers
        )
        
        if response.status_code == 200:
            evaluation = response.json()
            if "message" in evaluation:
                print(f"ℹ️ {evaluation['message']}")
            else:
                print(f"✅ Found evaluation for team {team_id}:")
                print(f"Total Score: {evaluation['total_score']}/70")
                print(f"Average Score: {evaluation['average_score']}/10")
                print(f"Status: {evaluation['evaluation_status']}")
        else:
            print(f"❌ Failed to get team evaluation: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_get_evaluation_summary():
    """Test getting evaluation summary for a team"""
    
    team_id = "TI-2024-001"
    
    try:
        response = requests.get(
            f"{BASE_URL}/judge/evaluation/summary/{team_id}"
        )
        
        if response.status_code == 200:
            summary = response.json()
            if "message" in summary:
                print(f"ℹ️ {summary['message']}")
            else:
                print(f"✅ Evaluation Summary for {summary['team_name']}:")
                print(f"Total Evaluations: {summary['total_evaluations']}")
                print(f"Average Total Score: {summary['average_total_score']}/70")
                print(f"Average Innovation: {summary['average_innovation']}/10")
                print(f"Average Problem Relevance: {summary['average_problem_relevance']}/10")
        else:
            print(f"❌ Failed to get evaluation summary: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_admin_endpoints():
    """Test admin endpoints (no authentication required for these)"""
    
    try:
        # Get all evaluations
        response = requests.get(f"{BASE_URL}/judge/evaluation/admin/all-evaluations")
        if response.status_code == 200:
            evaluations = response.json()
            print(f"✅ Admin: Retrieved {len(evaluations)} total evaluations")
        else:
            print(f"❌ Admin: Failed to get all evaluations: {response.status_code}")
        
        # Get leaderboard
        response = requests.get(f"{BASE_URL}/judge/evaluation/admin/leaderboard")
        if response.status_code == 200:
            leaderboard = response.json()
            print(f"✅ Admin: Retrieved leaderboard with {len(leaderboard)} teams")
            
            if leaderboard:
                print("\n🏆 Top 3 Teams:")
                for i, team in enumerate(leaderboard[:3]):
                    print(f"{i+1}. {team['team_name']} - Score: {team['total_score']}")
        else:
            print(f"❌ Admin: Failed to get leaderboard: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Admin Error: {str(e)}")

def main():
    """Run all tests"""
    
    print("🚀 Testing Judge Evaluation System")
    print("=" * 50)
    
    print("\n1. Testing Evaluation Submission...")
    test_submit_evaluation()
    
    print("\n2. Testing Draft Saving...")
    test_save_draft()
    
    print("\n3. Testing Get My Evaluations...")
    test_get_my_evaluations()
    
    print("\n4. Testing Get Team Evaluation...")
    test_get_team_evaluation()
    
    print("\n5. Testing Get Evaluation Summary...")
    test_get_evaluation_summary()
    
    print("\n6. Testing Admin Endpoints...")
    test_admin_endpoints()
    
    print("\n" + "=" * 50)
    print("✅ Testing completed!")

if __name__ == "__main__":
    main()
