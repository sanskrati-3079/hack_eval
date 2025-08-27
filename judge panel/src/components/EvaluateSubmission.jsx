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

  // Mock submission data
  const submission = {
    teamName: 'Team Innovators',
    teamId: 'TI-2024-001',
    problemStatement: 'Develop a sustainable solution for smart waste management in urban areas using IoT and AI technologies to optimize collection routes and reduce environmental impact.',
    description: 'Our solution leverages IoT sensors and machine learning algorithms to create an intelligent waste management system. The platform provides real-time monitoring of waste levels, optimizes collection routes, and provides analytics for better resource allocation. The system reduces operational costs by 30% and improves collection efficiency by 45%.',
    techStack: ['React', 'Node.js', 'Python', 'TensorFlow', 'IoT Sensors', 'MongoDB'],
    pptLink: 'https://docs.google.com/presentation/d/example',
    abstract: 'Our solution leverages IoT sensors and machine learning algorithms to create an intelligent waste management system. The platform provides real-time monitoring of waste levels, optimizes collection routes, and provides analytics for better resource allocation. The system reduces operational costs by 30% and improves collection efficiency by 45%.',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Evaluation submitted:', evaluation);
    // Here you would typically send the evaluation to your backend
    alert('Evaluation submitted successfully!');
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
              <p className="abstract">{submission.abstract}</p>
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
            <button type="button" className="btn btn-secondary">
              Save Draft
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Evaluation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvaluateSubmission;



