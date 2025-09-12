# Judge Evaluation System

This system allows judges to evaluate team submissions with detailed scoring and feedback. The evaluation data is stored in MongoDB with comprehensive tracking of scores, feedback, and evaluation history.

## 🏗️ System Architecture

### Database Collections
- **`team_evaluations`**: Stores individual judge evaluations
- **`evaluation_summary`**: Aggregated scores across all judges
- **`evaluation_criteria`**: Predefined evaluation criteria and weights
- **`judge_evaluation_history`**: Judge evaluation history and statistics

### Evaluation Criteria
Each team is evaluated on 7 parameters, each scored from 1-10:

1. **Innovation** - Originality and creativity of the solution
2. **Problem Relevance** - How well the solution addresses the problem
3. **Feasibility** - Practical implementation potential
4. **Tech Stack Justification** - Appropriateness of chosen technologies
5. **Clarity of Solution** - How well the solution is explained
6. **Presentation Quality** - Professionalism and clarity of presentation
7. **Team Understanding** - Depth of team knowledge and expertise

**Total Score**: Sum of all 7 criteria (maximum 70 points)
**Average Score**: Total score divided by 7 (maximum 10 points)

## 🚀 API Endpoints

### Judge Evaluation Endpoints

#### 1. Submit Evaluation
```http
POST /judge/evaluation/submit
Authorization: Bearer <judge_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "team_id": "TI-2024-001",
  "team_name": "Team Innovators",
  "problem_statement": "Develop a sustainable solution for smart waste management...",
  "category": "Smart Cities",
  "round_id": 1,
  "innovation": 8.5,
  "problem_relevance": 9.0,
  "feasibility": 7.5,
  "tech_stack_justification": 8.0,
  "clarity_of_solution": 8.5,
  "presentation_quality": 9.0,
  "team_understanding": 8.0,
  "personalized_feedback": "Excellent solution with innovative approach..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Evaluation submitted successfully",
  "evaluation_id": "uuid-here",
  "total_score": 67.5,
  "average_score": 9.64
}
```

#### 2. Save Draft
```http
POST /judge/evaluation/save-draft
Authorization: Bearer <judge_token>
Content-Type: application/json
```

Same request body as submit, but saves as draft for later editing.

#### 3. Get My Evaluations
```http
GET /judge/evaluation/my-evaluations
Authorization: Bearer <judge_token>
```

Returns all evaluations submitted by the authenticated judge.

#### 4. Get Team Evaluation
```http
GET /judge/evaluation/team/{team_id}?round_id=1
Authorization: Bearer <judge_token>
```

Returns evaluation for a specific team by the current judge.

#### 5. Get Evaluation Summary
```http
GET /judge/evaluation/summary/{team_id}?round_id=1
```

Returns aggregated evaluation summary for a team (no authentication required).

### Admin Endpoints

#### 1. Get All Evaluations
```http
GET /judge/evaluation/admin/all-evaluations?team_id=TI-2024-001&round_id=1&judge_id=judge123
```

Optional query parameters for filtering.

#### 2. Get Leaderboard
```http
GET /judge/evaluation/admin/leaderboard?round_id=1
```

Returns ranked list of teams based on evaluation scores.

## 💾 Database Schema

### TeamEvaluation Document
```json
{
  "_id": "ObjectId",
  "evaluation_id": "uuid-string",
  "judge_id": "judge123",
  "team_id": "TI-2024-001",
  "team_name": "Team Innovators",
  "problem_statement": "Problem description...",
  "category": "Smart Cities",
  "round_id": 1,
  "scores": {
    "innovation": 8.5,
    "problem_relevance": 9.0,
    "feasibility": 7.5,
    "tech_stack_justification": 8.0,
    "clarity_of_solution": 8.5,
    "presentation_quality": 9.0,
    "team_understanding": 8.0
  },
  "total_score": 67.5,
  "average_score": 9.64,
  "personalized_feedback": "Detailed feedback...",
  "evaluation_status": "submitted",
  "evaluated_at": "2024-01-15T10:30:00Z",
  "submitted_at": "2024-01-15T10:30:00Z"
}
```

### EvaluationSummary Document
```json
{
  "_id": "ObjectId",
  "team_id": "TI-2024-001",
  "team_name": "Team Innovators",
  "round_id": 1,
  "total_evaluations": 3,
  "average_total_score": 65.8,
  "average_innovation": 8.2,
  "average_problem_relevance": 8.7,
  "average_feasibility": 7.3,
  "average_tech_stack": 7.8,
  "average_clarity": 8.1,
  "average_presentation": 8.5,
  "average_team_understanding": 7.2,
  "last_updated": "2024-01-15T10:30:00Z"
}
```

## 🔐 Authentication

All judge endpoints require Bearer token authentication. The token should be obtained from the judge login endpoint.

**Example:**
```bash
curl -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
     -H "Content-Type: application/json" \
     -X POST http://localhost:8000/judge/evaluation/submit \
     -d '{"team_id": "TI-2024-001", ...}'
```

## 📊 Usage Examples

### Frontend Integration

#### React Component Example
```jsx
import React, { useState } from 'react';

const EvaluationForm = ({ teamId, teamName, problemStatement }) => {
  const [scores, setScores] = useState({
    innovation: 5,
    problem_relevance: 5,
    feasibility: 5,
    tech_stack_justification: 5,
    clarity_of_solution: 5,
    presentation_quality: 5,
    team_understanding: 5
  });
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/judge/evaluation/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${judgeToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          team_id: teamId,
          team_name: teamName,
          problem_statement: problemStatement,
          category: 'General',
          round_id: 1,
          ...scores,
          personalized_feedback: feedback
        })
      });
      
      const result = await response.json();
      if (result.success) {
        alert('Evaluation submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting evaluation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h3>Evaluate {teamName}</h3>
      {Object.entries(scores).map(([criteria, score]) => (
        <div key={criteria}>
          <label>{criteria.replace(/_/g, ' ').toUpperCase()}</label>
          <input
            type="range"
            min="1"
            max="10"
            value={score}
            onChange={(e) => setScores(prev => ({
              ...prev,
              [criteria]: parseInt(e.target.value)
            }))}
          />
          <span>{score}/10</span>
        </div>
      ))}
      <textarea
        placeholder="Personalized feedback..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />
      <button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
      </button>
    </div>
  );
};
```

### Python Script Example
```python
import requests

def submit_evaluation(judge_token, evaluation_data):
    url = "http://localhost:8000/judge/evaluation/submit"
    headers = {
        "Authorization": f"Bearer {judge_token}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, headers=headers, json=evaluation_data)
    return response.json()

# Example usage
evaluation = {
    "team_id": "TI-2024-001",
    "team_name": "Team Innovators",
    "problem_statement": "Smart waste management solution...",
    "category": "Smart Cities",
    "round_id": 1,
    "innovation": 8.5,
    "problem_relevance": 9.0,
    "feasibility": 7.5,
    "tech_stack_justification": 8.0,
    "clarity_of_solution": 8.5,
    "presentation_quality": 9.0,
    "team_understanding": 8.0,
    "personalized_feedback": "Excellent work on this project..."
}

result = submit_evaluation("your_judge_token", evaluation)
print(f"Evaluation submitted: {result}")
```

## 🧪 Testing

Use the provided `test_evaluation.py` script to test all endpoints:

```bash
cd Backend
python test_evaluation.py
```

**Note:** Update the `JUDGE_TOKEN` variable in the script with a valid judge JWT token.

## 📈 Features

- **Draft Saving**: Judges can save evaluations as drafts and submit later
- **Score Calculation**: Automatic calculation of total and average scores
- **Aggregation**: Real-time aggregation of scores across multiple judges
- **History Tracking**: Complete evaluation history for audit purposes
- **Leaderboard**: Automatic ranking based on evaluation scores
- **Admin Access**: Comprehensive admin endpoints for monitoring and analysis

## 🔧 Configuration

The system automatically creates the necessary MongoDB collections and initializes default evaluation criteria on startup. No additional configuration is required.

## 🚨 Error Handling

The API returns appropriate HTTP status codes and error messages:

- **400**: Bad Request (invalid data)
- **401**: Unauthorized (invalid/missing token)
- **404**: Not Found (team/evaluation not found)
- **500**: Internal Server Error (database/server issues)

## 📝 Notes

- All scores are automatically validated to be between 1-10
- Evaluation summaries are automatically updated when new evaluations are submitted
- The system supports multiple evaluation rounds
- Draft evaluations can be updated multiple times before final submission
- All timestamps are stored in UTC format
