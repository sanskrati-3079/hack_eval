import React, { useState, useEffect } from 'react';
import { 
  ExternalLink, 
  Download
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import './EvaluateSubmission.css';

const EvaluateSubmission = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedTeam = location.state?.selectedTeam;
  
  const [evaluation, setEvaluation] = useState({
    problem_solution_fit: 5,
    functionality_features: 5,
    technical_feasibility: 5,
    innovation_creativity: 5,
    user_experience: 5,
    impact_value: 5,
    presentation_demo_quality: 5,
    team_collaboration: 5,
    finalRecommendation: '',
    feedback: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [pptEvaluation, setPptEvaluation] = useState(null);
  const [loadingPptData, setLoadingPptData] = useState(false);

   
  // Load existing evaluation if available
  useEffect(() => {
    if (selectedTeam) {
      loadExistingEvaluation(selectedTeam.team_id);
      loadPptEvaluation(selectedTeam.team_name);
    }
  }, [selectedTeam]);

  const loadExistingEvaluation = async (teamId) => {
    try {
      const judgeToken = localStorage.getItem('judgeToken') || 'your_judge_token_here';
      
      const response = await fetch(`http://localhost:8000/judge/evaluation/${teamId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${judgeToken}`
        }
      });

      if (response.ok) {
        const existingEval = await response.json();
        setEvaluation({
          problem_solution_fit: existingEval.problem_solution_fit || 5,
          functionality_features: existingEval.functionality_features || 5,
          technical_feasibility: existingEval.technical_feasibility || 5,
          innovation_creativity: existingEval.innovation_creativity || 5,
          user_experience: existingEval.user_experience || 5,
          impact_value: existingEval.impact_value || 5,
          presentation_demo_quality: existingEval.presentation_demo_quality || 5,
          team_collaboration: existingEval.team_collaboration || 5,
          finalRecommendation: existingEval.final_recommendation || '',
          feedback: existingEval.personalized_feedback || ''
        });
      }
    } catch (error) {
      console.log('No existing evaluation found or error loading it');
    }
  };

  const loadPptEvaluation = async (teamName) => {
    if (!teamName) return;
    
    console.log('Loading PPT evaluation for team:', teamName);
    setLoadingPptData(true);
    try {
      const response = await fetch(`http://localhost:8000/api/team-evaluation/${encodeURIComponent(teamName)}`);
      
      console.log('PPT API Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('PPT API Response data:', result);
        setPptEvaluation(result.data);
      } else {
        console.log('No PPT evaluation data found for team:', teamName);
        const errorText = await response.text();
        console.log('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error loading PPT evaluation data:', error);
    } finally {
      setLoadingPptData(false);
    }
  };

  // If no team is selected, show selection message
  if (!selectedTeam) {
    return (
      <div className="evaluate-submission">
        <div className="page-header">
          <h1 className="page-title">Evaluate Submission</h1>
          <p className="page-subtitle">Please select a team to evaluate</p>
        </div>
        <div className="no-team-selected">
          <p>No team selected. Please go back and select a team to evaluate.</p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Debug: Log the team data structure
  console.log('Selected Team Data:', selectedTeam);
  console.log('Problem Statement Object:', selectedTeam.problem_statement);
  console.log('PPT Evaluation State:', pptEvaluation);
  console.log('Loading PPT Data:', loadingPptData);

  const handleSliderChange = (parameter, value) => {
    setEvaluation(prev => ({
      ...prev,
      [parameter]: parseInt(value)
    }));
  };

  const handleInputChange = (field, value) => {
    setEvaluation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!evaluation.feedback.trim()) {
      alert('Please provide personalized feedback before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('Submitting evaluation...');

    try {
      // Prepare data for backend API
      const evaluationData = {
        team_id: selectedTeam.team_id,
        team_name: selectedTeam.team_name,
        problem_statement: selectedTeam.problem_statement?.title || 'No problem statement',
        category: selectedTeam.problem_statement?.category || 'General',
        round_id: 1,
        problem_solution_fit: evaluation.problem_solution_fit,
        functionality_features: evaluation.functionality_features,
        technical_feasibility: evaluation.technical_feasibility,
        innovation_creativity: evaluation.innovation_creativity,
        user_experience: evaluation.user_experience,
        impact_value: evaluation.impact_value,
        presentation_demo_quality: evaluation.presentation_demo_quality,
        team_collaboration: evaluation.team_collaboration,
        personalized_feedback: evaluation.feedback
      };

      console.log('Sending evaluation data:', evaluationData);

      // Get judge token from localStorage or context
      const judgeToken = localStorage.getItem('judgeToken') || 'your_judge_token_here';
      
      const response = await fetch('http://localhost:8000/judge/evaluation/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${judgeToken}`
        },
        body: JSON.stringify(evaluationData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Evaluation submitted successfully:', result);
        setSubmitStatus('✅ Evaluation submitted successfully!');
        
        // Show success message
        alert(`Evaluation submitted successfully!\nTotal Score: ${result.total_score}/70\nAverage Score: ${result.average_score}/10`);
        
        // Wait for 2 seconds to show success message, then navigate to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
        
      } else {
        const errorData = await response.json();
        console.error('Failed to submit evaluation:', errorData);
        setSubmitStatus(`❌ Failed to submit: ${errorData.detail || 'Unknown error'}`);
        alert(`Failed to submit evaluation: ${errorData.detail || 'Unknown error'}`);
      }

    } catch (error) {
      console.error('Error submitting evaluation:', error);
      setSubmitStatus(`❌ Error: ${error.message}`);
      alert(`Error submitting evaluation: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!evaluation.feedback.trim()) {
      alert('Please provide personalized feedback before saving draft.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('Saving draft...');

    try {
      const evaluationData = {
        team_id: selectedTeam.team_id,
        team_name: selectedTeam.team_name,
        problem_statement: selectedTeam.problem_statement?.title || 'No problem statement',
        category: selectedTeam.problem_statement?.category || 'General',
        round_id: 1,
        problem_solution_fit: evaluation.problem_solution_fit,
        functionality_features: evaluation.functionality_features,
        technical_feasibility: evaluation.technical_feasibility,
        innovation_creativity: evaluation.innovation_creativity,
        user_experience: evaluation.user_experience,
        impact_value: evaluation.impact_value,
        presentation_demo_quality: evaluation.presentation_demo_quality,
        team_collaboration: evaluation.team_collaboration,
        personalized_feedback: evaluation.feedback
      };

      const judgeToken = localStorage.getItem('judgeToken') || 'your_judge_token_here';
      
      const response = await fetch('http://localhost:8000/judge/evaluation/save-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${judgeToken}`
        },
        body: JSON.stringify(evaluationData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Draft saved successfully:', result);
        setSubmitStatus('✅ Draft saved successfully!');
        alert('Draft saved successfully!');
        
        // Wait for 2 seconds to show success message, then navigate to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        const errorData = await response.json();
        setSubmitStatus(`❌ Failed to save draft: ${errorData.detail || 'Unknown error'}`);
        alert(`Failed to save draft: ${errorData.detail || 'Unknown error'}`);
      }

    } catch (error) {
      console.error('Error saving draft:', error);
      setSubmitStatus(`❌ Error: ${error.message}`);
      alert(`Error saving draft: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'error';
  };

  const getUniquenessColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getPlagiarismColor = (score) => {
    if (score <= 15) return 'success';
    if (score <= 30) return 'warning';
    return 'error';
  };

  return (
    <div className="evaluate-submission">
      <div className="page-header">
        <h1 className="page-title">Evaluate Submission</h1>
        <p className="page-subtitle">Review and evaluate team submission</p>
        <button className="btn btn-secondary back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Teams
        </button>
        <button 
          className="btn btn-primary" 
          onClick={() => loadPptEvaluation(selectedTeam.team_name)}
          style={{ marginLeft: '10px' }}
        >
          🔄 Reload PPT Data
        </button>
      </div>

      <div className="evaluation-container">
        {/* Project Metadata Section */}
        <div className="metadata-section card">
          <div className="metadata-header">
            <div className="team-info">
              <h2>{selectedTeam.team_name}</h2>
              <p className="team-id">ID: {selectedTeam.team_id}</p>
              <span className="category-badge">{selectedTeam.problem_statement?.category || 'General'}</span>
            </div>
            <div className="submission-meta">
              <p className="submission-date">Submitted: {selectedTeam.submission_date || 'N/A'}</p>
            </div>
          </div>

          <div className="metadata-content">
            <div className="metadata-item">
              <h3>Problem Statement</h3>
              <p className="problem-title">{selectedTeam.problem_statement?.title || 'No problem statement available'}</p>
              {selectedTeam.problem_statement?.description && (
                <div className="problem-description">
                  <p>{selectedTeam.problem_statement.description}</p>
                </div>
              )}
            </div>

            <div className="metadata-item">
              <h3>Team Leader</h3>
              {selectedTeam.team_leader ? (
                <div className="team-leader-info">
                  <p><strong>Name:</strong> {selectedTeam.team_leader.name}</p>
                  <p><strong>Roll No:</strong> {selectedTeam.team_leader.roll_no}</p>
                  <p><strong>Email:</strong> {selectedTeam.team_leader.email}</p>
                  <p><strong>Contact:</strong> {selectedTeam.team_leader.contact}</p>
                  <p><strong>Role:</strong> {selectedTeam.team_leader.role}</p>
                </div>
              ) : (
                <p>No team leader information available</p>
              )}
            </div>

            <div className="metadata-item">
              <h3>Team Members</h3>
              {selectedTeam.team_members && selectedTeam.team_members.length > 0 ? (
                <div className="team-members-list">
                  {selectedTeam.team_members.map((member, index) => (
                    <div key={index} className="member-card">
                      <div className="member-header">
                        <h4>{member.name}</h4>
                        <span className="member-role">{member.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No team members information available</p>
              )}
            </div>

            <div className="metadata-item">
              <h3>Project Details</h3>
              <div className="project-details">
                <div className="detail-row">
                  <strong>Category:</strong> {selectedTeam.problem_statement?.category || 'Not specified'}
                </div>
                <div className="detail-row">
                  <strong>Problem ID:</strong> {selectedTeam.problem_statement?.ps_id || 'Not specified'}
                </div>
              </div>
            </div>

            {/* Debug: Show raw data for development */}
            
          </div>
        </div>

        {/* PPT Evaluation by AI Section */}
        {loadingPptData && (
          <div className="ppt-evaluation-section card">
            <div className="section-header">
              <h2>PPT Evaluation by AI</h2>
              <div className="loading-indicator">Loading AI evaluation data...</div>
            </div>
          </div>
        )}

        {!loadingPptData && !pptEvaluation && (
          <div className="ppt-evaluation-section card">
            <div className="section-header">
              <h2>PPT Evaluation by AI</h2>
              <div className="loading-indicator">No PPT evaluation data found. Click "Reload PPT Data" to try again.</div>
            </div>
          </div>
        )}

        {pptEvaluation && (
          <div className="ppt-evaluation-section card">
            <div className="section-header">
              <h2>PPT Evaluation by AI</h2>
              <div className="evaluation-meta">
                <span className="evaluation-date">
                  Evaluated: {new Date(pptEvaluation.upload_timestamp).toLocaleDateString()}
                </span>
                <span className="evaluation-score">
                  Total Score: {pptEvaluation.total_weighted_score}/100
                </span>
              </div>
            </div>

            <div className="ppt-evaluation-content">
              {/* Debug: Show raw data */}
              {/* <div className="debug-section" style={{ background: '#f8f9fa', padding: '1rem', marginBottom: '1rem', borderRadius: '0.5rem' }}>
                <h3>🔍 Debug: Raw Data</h3>
                <pre style={{ fontSize: '0.75rem', overflow: 'auto' }}>
                  {JSON.stringify(pptEvaluation, null, 2)}
                </pre>
              </div> */}

              {/* AI Evaluation Scores */}
              <div className="ai-scores-section">
                <h3>AI Evaluation Scores</h3>
                <div className="ai-scores-grid">
                  {Object.entries(pptEvaluation.evaluation_scores).map(([parameter, score]) => (
                    <div key={parameter} className="ai-score-item">
                      <div className="ai-score-header">
                        <span className="ai-parameter-name">{parameter}</span>
                        <span className={`ai-score-value score-${getScoreColor(score)}`}>
                          {score}/10
                        </span>
                      </div>
                      <div className="ai-score-bar">
                        <div 
                          className="ai-score-fill" 
                          style={{ 
                            width: `${(score / 10) * 100}%`,
                            backgroundColor: score >= 8 ? '#10b981' : score >= 6 ? '#f59e0b' : '#ef4444'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw Score Summary */}
              <div className="raw-score-summary">
                <h3>Score Summary</h3>
                <div className="score-summary-grid">
                  <div className="score-item">
                    <span className="score-label">Total Raw Score:</span>
                    <span className="score-value">{pptEvaluation.total_raw_score}/70</span>
                  </div>
                  <div className="score-item">
                    <span className="score-label">Total Weighted Score:</span>
                    <span className="score-value">{pptEvaluation.total_weighted_score}/100</span>
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              {pptEvaluation.summary && (
                <div className="ai-summary-section">
                  <h3>AI Project Summary</h3>
                  <div className="ai-summary-content">
                    <p>{pptEvaluation.summary}</p>
                  </div>
                </div>
              )}

              {/* AI Workflow Analysis */}
              {pptEvaluation.workflow_overall && (
                <div className="ai-workflow-section">
                  <h3>AI Workflow Analysis</h3>
                  <div className="ai-workflow-content">
                    <p>{pptEvaluation.workflow_overall}</p>
                  </div>
                </div>
              )}

              {/* AI Feedback Sections */}
              <div className="ai-feedback-sections">
                {pptEvaluation.feedback_positive && (
                  <div className="ai-feedback-section positive">
                    <h3>✅ Positive Aspects</h3>
                    <div className="ai-feedback-content">
                      <p>{pptEvaluation.feedback_positive}</p>
                    </div>
                  </div>
                )}

                {pptEvaluation.feedback_criticism && (
                  <div className="ai-feedback-section criticism">
                    <h3>⚠️ Areas for Improvement</h3>
                    <div className="ai-feedback-content">
                      <p>{pptEvaluation.feedback_criticism}</p>
                    </div>
                  </div>
                )}

                {pptEvaluation.feedback_technical && (
                  <div className="ai-feedback-section technical">
                    <h3>🔧 Technical Analysis</h3>
                    <div className="ai-feedback-content">
                      <p>{pptEvaluation.feedback_technical}</p>
                    </div>
                  </div>
                )}

                {pptEvaluation.feedback_suggestions && (
                  <div className="ai-feedback-section suggestions">
                    <h3>💡 Recommendations</h3>
                    <div className="ai-feedback-content">
                      <p>{pptEvaluation.feedback_suggestions}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Evaluation Form */}
        <form className="evaluation-form card" onSubmit={handleSubmit}>
          <div className="form-header">
            <h2>Judging Parameters</h2>
            <p>Rate each parameter on a scale of 1-10</p>
          </div>

          <div className="parameters-grid">
            {[
              { 
                key: 'problem_solution_fit', 
                label: 'Problem-Solution Fit', 
                description: 'How well the prototype addresses the problem statement; alignment with ideation phase.',
                weightage: '10%'
              },
              { 
                key: 'functionality_features', 
                label: 'Functionality & Features', 
                description: 'Prototype actually works; number of implemented features; handling of real-world cases.',
                weightage: '20%'
              },
              { 
                key: 'technical_feasibility', 
                label: 'Technical Feasibility & Robustness', 
                description: 'System design, architecture, performance, scalability, basic security.',
                weightage: '20%'
              },
              { 
                key: 'innovation_creativity', 
                label: 'Innovation & Creativity', 
                description: 'Unique features, creative use of technology, disruptive potential.',
                weightage: '15%'
              },
              { 
                key: 'user_experience', 
                label: 'User Experience (UI/UX)', 
                description: 'Prototype is easy to use, visually clear, accessible, intuitive.',
                weightage: '15%'
              },
              { 
                key: 'impact_value', 
                label: 'Impact & Value Proposition', 
                description: 'Social/economic/environmental benefits; practical usefulness.',
                weightage: '10%'
              },
              { 
                key: 'presentation_demo_quality', 
                label: 'Presentation & Demo Quality', 
                description: 'Clarity of demo, ability to answer judges\' questions, professional presentation.',
                weightage: '5%'
              },
              { 
                key: 'team_collaboration', 
                label: 'Team Collaboration', 
                description: 'How well the team executed roles, solved challenges, and collaborated.',
                weightage: '5%'
              }
            ].map((param) => (
              <div key={param.key} className="parameter-item">
                <div className="parameter-header">
                  <label className="parameter-label">{param.label}</label>
                  <div className="parameter-meta">
                    <span className="parameter-weightage">{param.weightage}</span>
                    <span className={`parameter-score score-${getScoreColor(evaluation[param.key])}`}>
                      {evaluation[param.key]}/10
                    </span>
                  </div>
                </div>
                <p className="parameter-description">{param.description}</p>
                <div className="slider-container">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={evaluation[param.key]}
                    onChange={(e) => handleSliderChange(param.key, e.target.value)}
                    className="slider"
                  />
                  <div className="slider-labels">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="form-section">
            <label className="form-label">Personalized Feedback</label>
            <textarea
              value={evaluation.feedback}
              onChange={(e) => handleInputChange('feedback', e.target.value)}
              className="form-textarea"
              placeholder="Provide detailed feedback for the team..."
              rows="4"
              required
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Draft'}
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
            </button>
          </div>

          {submitStatus && (
            <div className={`submit-status ${submitStatus.includes('✅') ? 'success' : submitStatus.includes('❌') ? 'error' : 'info'}`}>
              {submitStatus}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EvaluateSubmission;