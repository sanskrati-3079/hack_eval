import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  Eye,
  Calendar,
  Star,
  Loader2
} from 'lucide-react';
import { getMyEvaluations, getTeamDetails } from '../utils/api';
import './MyEvaluations.css';

const MyEvaluations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



    // Fetch evaluations from backend
  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getMyEvaluations();
      console.log('Fetched evaluations:', data);
      
      // Transform the data to match our component structure
      const transformedEvaluations = data.map(evaluation => ({
        id: evaluation.evaluation_id || evaluation._id,
        teamName: evaluation.team_name,
        projectName: evaluation.problem_statement,
        submissionDate: evaluation.submitted_at ? new Date(evaluation.submitted_at).toISOString().split('T')[0] : 'N/A',
        evaluationDate: evaluation.evaluated_at ? new Date(evaluation.evaluated_at).toISOString().split('T')[0] : 'N/A',
        totalScore: evaluation.total_score || 0,
        status: evaluation.evaluation_status === 'submitted' ? 'Approved' : evaluation.evaluation_status,
        recommendation: getRecommendation(evaluation.total_score || 0),
        feedback: evaluation.personalized_feedback || 'No feedback provided',
        category: evaluation.category || 'General',
        scores: evaluation.scores || {},
        details: {
          teamId: evaluation.team_id,
          category: evaluation.category || 'General',
          problemStatement: evaluation.problem_statement,
          description: evaluation.problem_statement, // Using problem statement as description for now
          techStack: [], // This would need to be fetched from team details
          pptLink: '', // This would need to be fetched from team details
          abstract: evaluation.personalized_feedback || 'No abstract available'
        }
      }));

      setEvaluations(transformedEvaluations);
    } catch (err) {
      console.error('Error fetching evaluations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get recommendation based on score
  const getRecommendation = (score) => {
    if (score >= 8) return 'Proceed to Next Round';
    if (score >= 6) return 'Needs Improvement';
    return 'Rejected';
  };

  // Fetch team details for a specific evaluation
  const fetchTeamDetails = async (teamId) => {
    try {
      const teamData = await getTeamDetails(teamId);
      return teamData;
    } catch (err) {
      console.warn('Error fetching team details:', err);
      return null;
    }
  };

  // Enhanced openDetails function that fetches team details
  const openDetails = async (evaluation) => {
    setSelectedEvaluation(evaluation);
    setIsDetailsOpen(true);
    
    // Try to fetch additional team details
    if (evaluation.details?.teamId) {
      const teamDetails = await fetchTeamDetails(evaluation.details.teamId);
      if (teamDetails) {
        // Update the evaluation with team details
        setSelectedEvaluation(prev => ({
          ...prev,
          details: {
            ...prev.details,
            techStack: teamDetails.tech_stack || [],
            pptLink: teamDetails.presentation_link || '',
            abstract: teamDetails.abstract || prev.details.abstract
          }
        }));
      }
    }
  };

  // Load evaluations on component mount
  useEffect(() => {
    fetchEvaluations();
  }, []);

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

  const closeDetails = () => {
    setIsDetailsOpen(false);
    setSelectedEvaluation(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="my-evaluations">
        <div className="page-header">
          <div className="header-content">
            <div>
              <h1 className="page-title">My Evaluations</h1>
              <p className="page-subtitle">Review your completed evaluations</p>
            </div>
          </div>
        </div>
        <div className="loading-state">
          <Loader2 size={48} className="loading-spinner" />
          <p>Loading your evaluations...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="my-evaluations">
        <div className="page-header">
          <div className="header-content">
            <div>
              <h1 className="page-title">My Evaluations</h1>
              <p className="page-subtitle">Review your completed evaluations</p>
            </div>
          </div>
        </div>
        <div className="error-state">
          <p className="error-message">Error: {error}</p>
          <button className="btn btn-primary" onClick={fetchEvaluations}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-evaluations">
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">My Evaluations</h1>
            <p className="page-subtitle">Review your completed evaluations</p>
          </div>
          <button className="btn btn-primary" onClick={fetchEvaluations} disabled={loading}>
            <Loader2 size={16} className={loading ? 'loading-spinner' : ''} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
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
                  {evaluation.totalScore}/100
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
            </div>
          </div>
        ))}
      </div>

      {filteredEvaluations.length === 0 && !loading && (
        <div className="empty-state">
          <h3>No evaluations found</h3>
          <p>You haven't completed any evaluations yet, or try adjusting your search criteria.</p>
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
                <p className="abstract">Status: {selectedEvaluation.status} • Score: {selectedEvaluation.totalScore}/100</p>
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



