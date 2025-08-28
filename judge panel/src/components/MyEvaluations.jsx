import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Eye,
  Calendar,
  Star
} from 'lucide-react';
import './MyEvaluations.css';

const MyEvaluations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  // Mock evaluations data
  const evaluations = [
    {
      id: 'EV-001',
      teamName: 'Team Innovators',
      projectName: 'Smart Waste Management',
      submissionDate: '2024-01-15',
      evaluationDate: '2024-01-16',
      totalScore: 8.5,
      status: 'Approved',
      recommendation: 'Proceed to Next Round',
      feedback: 'Excellent innovation and well-executed solution. Strong technical implementation with clear problem understanding.',
      // Details mirrored from EvaluateSubmission
      details: {
        teamId: 'TI-2024-001',
        category: 'Smart Cities',
        problemStatement: 'Develop a sustainable solution for smart waste management in urban areas using IoT and AI technologies to optimize collection routes and reduce environmental impact.',
        description: 'Our solution leverages IoT sensors and machine learning algorithms to create an intelligent waste management system. The platform provides real-time monitoring of waste levels, optimizes collection routes, and provides analytics for better resource allocation. The system reduces operational costs by 30% and improves collection efficiency by 45%.',
        techStack: ['React', 'Node.js', 'Python', 'TensorFlow', 'IoT Sensors', 'MongoDB'],
        pptLink: 'https://docs.google.com/presentation/d/example',
        abstract: 'The proposal for a Paperless Scholarship Disbursement System presents a solid foundation with innovative features like AI-based document verification and real-time updates. However, it lacks detailed metrics, datasets, and a comprehensive evaluation plan, which are critical for assessing the project\'s feasibility and impact. The architecture is described adequately, but scalability and cost estimates are vague. Overall, the project shows promise but requires more concrete evidence and planning.'
      }
    },
    {
      id: 'EV-002',
      teamName: 'CodeCrafters',
      projectName: 'AI-Powered Education Platform',
      submissionDate: '2024-01-14',
      evaluationDate: '2024-01-15',
      totalScore: 7.2,
      status: 'Needs Improvement',
      feedback: 'Good concept but needs better technical implementation. Consider improving the user interface and adding more features.',
      details: {
        teamId: 'CC-2024-014',
        category: 'Education',
        problemStatement: 'Improve remote learning outcomes using adaptive AI tutoring.',
        description: 'An adaptive learning platform that personalizes content difficulty and pacing using student performance signals. Includes analytics dashboards for educators.',
        techStack: ['React', 'Express', 'PostgreSQL', 'PyTorch'],
        pptLink: 'https://docs.google.com/presentation/d/example2',
        abstract: 'Adaptive tutoring shows promise for increasing engagement. Further validation and dataset clarity needed.'
      }
    },
    {
      id: 'EV-003',
      teamName: 'TechVision',
      projectName: 'Healthcare Monitoring System',
      submissionDate: '2024-01-13',
      evaluationDate: '2024-01-14',
      totalScore: 9.1,
      status: 'Approved',
      feedback: 'Outstanding project with excellent technical depth. Very innovative solution with great potential for real-world application.',
      details: {
        teamId: 'TV-2024-008',
        category: 'Healthcare',
        problemStatement: 'Continuous patient monitoring with proactive alerts.',
        description: 'Edge IoT and cloud analytics to track vitals and alert clinicians in real-time with anomaly detection.',
        techStack: ['Next.js', 'FastAPI', 'TimescaleDB', 'IoT'],
        pptLink: 'https://docs.google.com/presentation/d/example3',
        abstract: 'Promising architecture with clear clinical pathways and data governance considerations.'
      }
    },
    {
      id: 'EV-004',
      teamName: 'DataMasters',
      projectName: 'Predictive Analytics Dashboard',
      submissionDate: '2024-01-12',
      evaluationDate: '2024-01-13',
      totalScore: 6.8,
      status: 'Rejected',
      feedback: 'Concept is good but implementation lacks depth. Technical stack could be better chosen for the problem domain.',
      details: {
        teamId: 'DM-2024-021',
        category: 'Analytics',
        problemStatement: 'Forecast operational KPIs across departments with explainability.',
        description: 'Unified dashboard pulling data from multiple sources, with forecasting and SHAP-based explanations for business users.',
        techStack: ['Vue', 'Flask', 'MongoDB', 'XGBoost'],
        pptLink: 'https://docs.google.com/presentation/d/example4',
        abstract: 'Needs stronger validation strategy and cost-benefit analysis.'
      }
    }
  ];

  const filteredEvaluations = evaluations.filter(evaluation => {
    const matchesSearch = evaluation.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evaluation.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || evaluation.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'success';
      case 'needs improvement': return 'warning';
      case 'rejected': return 'error';
      default: return 'info';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'error';
  };

  const openDetails = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setIsDetailsOpen(true);
  };

  const closeDetails = () => {
    setIsDetailsOpen(false);
    setSelectedEvaluation(null);
  };

  return (
    <div className="my-evaluations">
      <div className="page-header">
        <h1 className="page-title">My Evaluations</h1>
        <p className="page-subtitle">Review your completed evaluations</p>
      </div>

      {/* Filters and Search */}
      <div className="filters-section card">
        <div className="filters-row">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search by team name or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-controls">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="needs improvement">Needs Improvement</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Evaluations List */}
      <div className="evaluations-grid">
        {filteredEvaluations.map((evaluation) => (
          <div key={evaluation.id} className="evaluation-card card">
            <div className="evaluation-header">
              <div className="evaluation-meta">
                <h3>{evaluation.teamName}</h3>
                <p className="project-name">{evaluation.projectName}</p>
                <div className="evaluation-dates">
                  <span className="date-item">
                    <Calendar size={14} />
                    Submitted: {evaluation.submissionDate}
                  </span>
                  <span className="date-item">
                    <Calendar size={14} />
                    Evaluated: {evaluation.evaluationDate}
                  </span>
                </div>
              </div>
              <div className="evaluation-score">
                <div className={`score-badge score-${getScoreColor(evaluation.totalScore)}`}>
                  <Star size={16} />
                  {evaluation.totalScore}/10
                </div>
                <div className={`status-badge status-${getStatusColor(evaluation.status)}`}>
                  {evaluation.status}
                </div>
              </div>
            </div>

            <div className="evaluation-content">
              <div className="recommendation">
                <strong>Recommendation:</strong> {evaluation.recommendation}
              </div>
              <div className="feedback">
                <strong>Feedback:</strong>
                <p>{evaluation.feedback}</p>
              </div>
            </div>

            <div className="evaluation-actions">
              <button className="btn btn-secondary" onClick={() => openDetails(evaluation)}>
                <Eye size={16} />
                View Details
              </button>
              {/* <button className="btn btn-secondary">
                <Download size={16} />
                Export
              </button> */}
            </div>
          </div>
        ))}
      </div>

      {filteredEvaluations.length === 0 && (
        <div className="empty-state">
          <h3>No evaluations found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {isDetailsOpen && selectedEvaluation && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="team-info">
                <h2>{selectedEvaluation.teamName}</h2>
                {selectedEvaluation.details?.teamId && (
                  <p className="team-id">ID: {selectedEvaluation.details.teamId}</p>
                )}
                {selectedEvaluation.details?.category && (
                  <span className="category-badge">{selectedEvaluation.details.category}</span>
                )}
              </div>
              <button className="modal-close" onClick={closeDetails}>×</button>
            </div>

            <div className="metadata-content">
              {selectedEvaluation.details?.problemStatement && (
                <div className="metadata-item">
                  <h3>Problem Statement</h3>
                  <p>{selectedEvaluation.details.problemStatement}</p>
                </div>
              )}

              {selectedEvaluation.details?.description && (
                <div className="metadata-item">
                  <h3>Description</h3>
                  <p className="abstract">{selectedEvaluation.details.description}</p>
                </div>
              )}

              {selectedEvaluation.details?.techStack?.length > 0 && (
                <div className="metadata-item">
                  <h3>Tech Stack</h3>
                  <div className="tech-stack">
                    {selectedEvaluation.details.techStack.map((tech, index) => (
                      <span key={index} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedEvaluation.details?.abstract && (
                <div className="metadata-item">
                  <h3>AI-Generated Abstract</h3>
                  <p className="abstract" style={{ whiteSpace: 'pre-line' }}>{selectedEvaluation.details.abstract}</p>
                </div>
              )}

              {(selectedEvaluation.details?.pptLink || selectedEvaluation.submissionDate) && (
                <div className="metadata-item">
                  <h3>Submission</h3>
                  <div className="presentation-links">
                    {selectedEvaluation.details?.pptLink && (
                      <a href={selectedEvaluation.details.pptLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">View Presentation</a>
                    )}
                    {selectedEvaluation.submissionDate && (
                      <span className="submission-date">Submitted: {selectedEvaluation.submissionDate}</span>
                    )}
                  </div>
                </div>
              )}

              <div className="metadata-item">
                <h3>Evaluation Summary</h3>
                <p className="abstract">Status: {selectedEvaluation.status} • Score: {selectedEvaluation.totalScore}/10</p>
                {selectedEvaluation.recommendation && (
                  <p className="abstract">Recommendation: {selectedEvaluation.recommendation}</p>
                )}
                {selectedEvaluation.feedback && (
                  <p className="abstract" style={{ marginTop: '0.5rem' }}>Feedback: {selectedEvaluation.feedback}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEvaluations;



