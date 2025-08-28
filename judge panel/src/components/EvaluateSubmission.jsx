import React, { useState } from 'react';
import { 
  ExternalLink, 
  Download
} from 'lucide-react';
import './EvaluateSubmission.css';

const EvaluateSubmission = () => {
  const [evaluation, setEvaluation] = useState({
    innovation: 5,
    problemRelevance: 5,
    feasibility: 5,
    techStackJustification: 5,
    clarityOfSolution: 5,
    presentationQuality: 5,
    teamUnderstanding: 5,
    finalRecommendation: '',
    feedback: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  // Mock submission data
  const submission = {
    teamName: 'Team Innovators',
    teamId: 'TI-2024-001',
    problemStatement: 'Develop a sustainable solution for smart waste management in urban areas using IoT and AI technologies to optimize collection routes and reduce environmental impact.',
    description: 'Our solution leverages IoT sensors and machine learning algorithms to create an intelligent waste management system. The platform provides real-time monitoring of waste levels, optimizes collection routes, and provides analytics for better resource allocation. The system reduces operational costs by 30% and improves collection efficiency by 45%.',
    techStack: ['React', 'Node.js', 'Python', 'TensorFlow', 'IoT Sensors', 'MongoDB'],
    pptLink: 'https://docs.google.com/presentation/d/example',
    abstract: `The proposal for a Paperless Scholarship Disbursement System presents a solid foundation with innovative features like AI-based document verification and real-time updates. However, it lacks detailed metrics, datasets, and a comprehensive evaluation plan, which are critical for assessing the project's feasibility and impact. The architecture is described adequately, but scalability and cost estimates are vague. Overall, the project shows promise but requires more concrete evidence and planning.`,
    uniquenessScore: 85,
    plagiarismScore: 12,
    submissionDate: '2024-01-15',
    category: 'Smart Cities'
  };

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
        team_id: submission.teamId,
        team_name: submission.teamName,
        problem_statement: submission.problemStatement,
        category: submission.category,
        round_id: 1,
        innovation: evaluation.innovation,
        problem_relevance: evaluation.problemRelevance,
        feasibility: evaluation.feasibility,
        tech_stack_justification: evaluation.techStackJustification,
        clarity_of_solution: evaluation.clarityOfSolution,
        presentation_quality: evaluation.presentationQuality,
        team_understanding: evaluation.teamUnderstanding,
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
        
        // Reset form
        setEvaluation({
          innovation: 5,
          problemRelevance: 5,
          feasibility: 5,
          techStackJustification: 5,
          clarityOfSolution: 5,
          presentationQuality: 5,
          teamUnderstanding: 5,
          finalRecommendation: '',
          feedback: ''
        });
        
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
        team_id: submission.teamId,
        team_name: submission.teamName,
        problem_statement: submission.problemStatement,
        category: submission.category,
        round_id: 1,
        innovation: evaluation.innovation,
        problem_relevance: evaluation.problemRelevance,
        feasibility: evaluation.feasibility,
        tech_stack_justification: evaluation.techStackJustification,
        clarity_of_solution: evaluation.clarityOfSolution,
        presentation_quality: evaluation.presentationQuality,
        team_understanding: evaluation.teamUnderstanding,
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
      </div>

      <div className="evaluation-container">
        {/* Project Metadata Section */}
        <div className="metadata-section card">
          <div className="metadata-header">
            <div className="team-info">
              <h2>{submission.teamName}</h2>
              <p className="team-id">ID: {submission.teamId}</p>
              <span className="category-badge">{submission.category}</span>
            </div>
            <div className="submission-meta">
              <p className="submission-date">Submitted: {submission.submissionDate}</p>
            </div>
          </div>

          <div className="metadata-content">
            <div className="metadata-item">
              <h3>Problem Statement</h3>
              <p>{submission.problemStatement}</p>
            </div>

            <div className="metadata-item">
              <h3>Description</h3>
              <p className="abstract">{submission.description}</p>
            </div>

            <div className="metadata-item">
              <h3>Tech Stack</h3>
              <div className="tech-stack">
                {submission.techStack.map((tech, index) => (
                  <span key={index} className="tech-tag">{tech}</span>
                ))}
              </div>
            </div>

            <div className="metadata-item">
              <h3>AI-Generated Abstract</h3>
              <p className="abstract" style={{ whiteSpace: 'pre-line' }}>{submission.abstract}</p>
            </div>

            <div className="metadata-item">
              <h3>Presentation</h3>
              <div className="presentation-links">
                <a href={submission.pptLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                  <ExternalLink size={16} />
                  View Presentation
                </a>
                {/* <button className="btn btn-secondary">
                  <Download size={16} />
                  Download PPT
                </button> */}
              </div>
            </div>

            {/* <div className="metadata-item">
              <h3>Quality Metrics</h3>
              <div className="quality-metrics">
                <div className="metric">
                  <span className="metric-label">Uniqueness Score</span>
                  <div className="metric-value">
                    <div className={`progress-bar ${getUniquenessColor(submission.uniquenessScore)}`}>
                      <div 
                        className="progress-fill" 
                        style={{ width: `${submission.uniquenessScore}%` }}
                      ></div>
                    </div>
                    <span className="metric-score">{submission.uniquenessScore}%</span>
                  </div>
                </div>
                <div className="metric">
                  <span className="metric-label">Plagiarism Score</span>
                  <div className="metric-value">
                    <div className={`progress-bar ${getPlagiarismColor(submission.plagiarismScore)}`}>
                      <div 
                        className="progress-fill" 
                        style={{ width: `${submission.plagiarismScore}%` }}
                      ></div>
                    </div>
                    <span className="metric-score">{submission.plagiarismScore}%</span>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>

        {/* Evaluation Form */}
        <form className="evaluation-form card" onSubmit={handleSubmit}>
          <div className="form-header">
            <h2>Judging Parameters</h2>
            <p>Rate each parameter on a scale of 1-10</p>
          </div>

          <div className="parameters-grid">
            {[
              { key: 'innovation', label: 'Innovation', description: 'Originality and creativity of the solution' },
              { key: 'problemRelevance', label: 'Problem Relevance', description: 'How well the solution addresses the problem' },
              { key: 'feasibility', label: 'Feasibility', description: 'Practical implementation potential' },
              { key: 'techStackJustification', label: 'Tech Stack Justification', description: 'Appropriateness of chosen technologies' },
              { key: 'clarityOfSolution', label: 'Clarity of Solution', description: 'How well the solution is explained' },
              { key: 'presentationQuality', label: 'Presentation Quality', description: 'Professionalism and clarity of presentation' },
              { key: 'teamUnderstanding', label: 'Team Understanding', description: 'Depth of team knowledge and expertise' }
            ].map((param) => (
              <div key={param.key} className="parameter-item">
                <div className="parameter-header">
                  <label className="parameter-label">{param.label}</label>
                  <span className={`parameter-score score-${getScoreColor(evaluation[param.key])}`}>
                    {evaluation[param.key]}/10
                  </span>
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

          {/* <div className="form-section">
            <label className="form-label">Final Recommendation</label>
            <select
              value={evaluation.finalRecommendation}
              onChange={(e) => handleInputChange('finalRecommendation', e.target.value)}
              className="form-select"
              required
            >
              <option value="">Select recommendation</option>
              <option value="proceed">Proceed to Next Round</option>
              <option value="improvement">Needs Improvement</option>
              <option value="rejected">Rejected</option>
            </select>
          </div> */}

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