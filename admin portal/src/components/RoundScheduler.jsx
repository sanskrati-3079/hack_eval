import React, { useState, useEffect } from 'react';
import './RoundScheduler.css';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Upload, 
  Edit, 
  Trash2,
  Eye,
  Loader,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const RoundScheduler = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedRound, setSelectedRound] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Fetch rounds from API
  const fetchRounds = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/admin/rounds`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch rounds: ${response.status}`);
      }
      
      const data = await response.json();
      setRounds(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching rounds:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRounds();
  }, []);

  const showMessage = (message, type = 'error') => {
    if (type === 'error') {
      setError(message);
    } else {
      setSuccess(message);
    }
    
    setTimeout(() => {
      if (type === 'error') {
        setError(null);
      } else {
        setSuccess(null);
      }
    }, 5000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft': return <span className="badge badge-warning">Draft</span>;
      case 'scheduled': return <span className="badge badge-info">Scheduled</span>;
      case 'ongoing': return <span className="badge badge-success">Live</span>;
      case 'completed': return <span className="badge badge-secondary">Completed</span>;
      default: return <span className="badge badge-warning">Draft</span>;
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEditRound = (round) => {
    setSelectedRound(round);
    setShowModal(true);
  };

  const handleAddRound = () => {
    setSelectedRound(null);
    setShowModal(true);
  };

  const handleDeleteRound = async (roundId) => {
    const round = rounds.find((r) => r.round_id === roundId);
    const name = round ? round.name : 'this round';
    
    if (!window.confirm(`Delete ${name}? This action cannot be undone.`)) return;
    
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/rounds/${roundId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        showMessage('Authentication required. Please log in again.');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to delete round: ${response.status}`);
      }
      
      await fetchRounds();
      showMessage('Round deleted successfully!', 'success');
    } catch (err) {
      showMessage(`Failed to delete round: ${err.message}`);
      console.error('Error deleting round:', err);
    }
  };

  const handleSaveRound = async (roundData) => {
    try {
      // Convert to proper format for backend
      const submitData = {
        ...roundData,
        start_time: roundData.start_time,
        end_time: roundData.end_time,
        judges_required: parseInt(roundData.judges_required),
      };
      
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/rounds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        
        let errorMessage = `Failed to save round: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      await fetchRounds();
      setShowModal(false);
      setSelectedRound(null);
      showMessage('Round created successfully!', 'success');
    } catch (err) {
      showMessage(`Failed to save round: ${err.message}`);
      console.error('Error saving round:', err);
    }
  };

  if (loading) {
    return (
      <div className="round-scheduler">
        <div className="page-header">
          <h1 className="page-title">Round Scheduler</h1>
          <p className="page-subtitle">Manage hackathon rounds, schedules, and deadlines</p>
        </div>
        <div className="loading-container">
          <Loader size={32} className="spinner" />
          <p>Loading rounds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="round-scheduler">
      <div className="page-header">
        <h1 className="page-title">Round Scheduler</h1>
        <p className="page-subtitle">Manage hackathon rounds, schedules, and deadlines</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="alert-close"
          >
            ×
          </button>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          <span>{success}</span>
          <button 
            onClick={() => setSuccess(null)} 
            className="alert-close"
          >
            ×
          </button>
        </div>
      )}

      <div className="action-bar">
        <div className="view-controls">
          <button 
            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('list')}
          >
            <Eye size={16} />
            List View
          </button>
          <button 
            className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('calendar')}
          >
            <Calendar size={16} />
            Calendar View
          </button>
        </div>
        <button className="btn btn-primary" onClick={handleAddRound}>
          <Plus size={16} />
          Add New Round
        </button>
      </div>

      {viewMode === 'list' ? (
        <div className="rounds-list">
          {rounds.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} />
              <h3>No Rounds Scheduled</h3>
              <p>Get started by creating your first hackathon round</p>
              <button className="btn btn-primary" onClick={handleAddRound}>
                <Plus size={16} />
                Add New Round
              </button>
            </div>
          ) : (
            rounds.map((round) => (
              <div key={round.round_id} className="round-card card">
                <div className="card-body">
                  <div className="round-header">
                    <div className="round-info">
                      <h3 className="round-name">{round.name}</h3>
                      <p className="round-description">{round.description}</p>
                    </div>
                    <div className="round-status">
                      {getStatusBadge(round.status)}
                    </div>
                  </div>
                  
                  <div className="round-details">
                    <div className="detail-item">
                      <Clock size={16} />
                      <div><strong>Start:</strong> {formatDateTime(round.start_time)}</div>
                    </div>
                    <div className="detail-item">
                      <Clock size={16} />
                      <div><strong>End:</strong> {formatDateTime(round.end_time)}</div>
                    </div>
                    <div className="detail-item">
                      <Upload size={16} />
                      <div><strong>Category:</strong> {round.category}</div>
                    </div>
                    <div className="detail-item">
                      <strong>Judges Required:</strong> {round.judges_required}
                    </div>
                  </div>

                  <div className="round-actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleEditRound(round)}
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button 
                      className="btn btn-error" 
                      onClick={() => handleDeleteRound(round.round_id)}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="calendar-view">
          <div className="calendar-placeholder">
            <Calendar size={48} />
            <h3>Calendar View</h3>
            <p>Calendar view will be implemented here with a proper calendar component</p>
          </div>
        </div>
      )}

      {/* Add/Edit Round Modal */}
      {showModal && (
        <RoundModal 
          round={selectedRound}
          onClose={() => {
            setShowModal(false);
            setSelectedRound(null);
          }}
          onSave={handleSaveRound}
        />
      )}
    </div>
  );
};

// Round Modal Component
const RoundModal = ({ round, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: round?.name || '',
    description: round?.description || '',
    start_time: round?.start_time ? new Date(round.start_time).toISOString().slice(0, 16) : '',
    end_time: round?.end_time ? new Date(round.end_time).toISOString().slice(0, 16) : '',
    category: round?.category || '',
    judges_required: round?.judges_required || 3,
    evaluation_criteria: round?.evaluation_criteria || [
      { "problem_solution_fit": 10 },
      { "functionality_features": 20 },
      { "technical_feasibility": 20 },
      { "innovation_creativity": 15 },
      { "user_experience": 15 },
      { "impact_value": 10 },
      { "presentation_demo_quality": 5 },
      { "team_collaboration": 5 }
    ]
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Round name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.start_time) newErrors.start_time = 'Start time is required';
    if (!formData.end_time) newErrors.end_time = 'End time is required';
    if (new Date(formData.end_time) <= new Date(formData.start_time)) {
      newErrors.end_time = 'End time must be after start time';
    }
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.judges_required || formData.judges_required < 1) {
      newErrors.judges_required = 'At least one judge is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    
    try {
      // Convert datetime strings to proper format
      const submitData = {
        ...formData,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        judges_required: parseInt(formData.judges_required),
        evaluation_criteria: formData.evaluation_criteria
      };
      
      await onSave(submitData);
    } catch (err) {
      console.error('Error in form submission:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{round ? 'Edit Round' : 'Add New Round'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Round Name *</label>
              <input
                type="text"
                name="name"
                className={`form-input ${errors.name ? 'error' : ''}`}
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                name="description"
                className={`form-input ${errors.description ? 'error' : ''}`}
                value={formData.description}
                onChange={handleChange}
                rows="3"
                required
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Time *</label>
                <input
                  type="datetime-local"
                  name="start_time"
                  className={`form-input ${errors.start_time ? 'error' : ''}`}
                  value={formData.start_time}
                  onChange={handleChange}
                  required
                />
                {errors.start_time && <span className="error-text">{errors.start_time}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">End Time *</label>
                <input
                  type="datetime-local"
                  name="end_time"
                  className={`form-input ${errors.end_time ? 'error' : ''}`}
                  value={formData.end_time}
                  onChange={handleChange}
                  required
                />
                {errors.end_time && <span className="error-text">{errors.end_time}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <input
                  type="text"
                  name="category"
                  className={`form-input ${errors.category ? 'error' : ''}`}
                  value={formData.category}
                  onChange={handleChange}
                  required
                />
                {errors.category && <span className="error-text">{errors.category}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Judges Required *</label>
                <input
                  type="number"
                  name="judges_required"
                  className={`form-input ${errors.judges_required ? 'error' : ''}`}
                  value={formData.judges_required}
                  onChange={handleChange}
                  min="1"
                  required
                />
                {errors.judges_required && <span className="error-text">{errors.judges_required}</span>}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? <Loader size={16} className="spinner" /> : null}
              {round ? 'Update Round' : 'Create Round'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoundScheduler;