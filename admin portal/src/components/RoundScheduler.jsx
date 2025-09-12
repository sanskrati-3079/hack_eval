// RoundScheduler.jsx
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
  Loader
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const RoundScheduler = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedRound, setSelectedRound] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch rounds from API
  const fetchRounds = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/rounds/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRounds(data);
      setError(null);
    } catch (err) {
      setError(`Failed to load rounds: ${err.message}`);
      console.error('Error fetching rounds:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRounds();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft': return <span className="badge badge-warning">Draft</span>;
      case 'live': return <span className="badge badge-success">Live</span>;
      case 'completed': return <span className="badge badge-info">Completed</span>;
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
    const round = rounds.find((r) => r.id === roundId);
    const name = round ? round.name : 'this round';
    
    if (!window.confirm(`Delete ${name}? This action cannot be undone.`)) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/rounds/${roundId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Refresh the rounds list
      await fetchRounds();
    } catch (err) {
      setError(`Failed to delete round: ${err.message}`);
      console.error('Error deleting round:', err);
    }
  };

  const handleSaveRound = async (roundData) => {
    try {
      let response;
      
      if (selectedRound) {
        // Update existing round
        response = await fetch(`${API_BASE_URL}/rounds/${selectedRound.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(roundData),
        });
      } else {
        // Add new round
        response = await fetch(`${API_BASE_URL}/rounds/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(roundData),
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      // Refresh the rounds list
      await fetchRounds();
      setShowModal(false);
      setSelectedRound(null);
    } catch (err) {
      setError(`Failed to save round: ${err.message}`);
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
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>×</button>
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
              <div key={round.id} className="round-card card">
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
                      <div><strong>Upload Deadline:</strong> {formatDateTime(round.upload_deadline)}</div>
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
                      onClick={() => handleDeleteRound(round.id)}
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
          onClose={() => setShowModal(false)}
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
    start_time: round?.start_time ? round.start_time.slice(0, 16) : '',
    end_time: round?.end_time ? round.end_time.slice(0, 16) : '',
    upload_deadline: round?.upload_deadline ? round.upload_deadline.slice(0, 16) : '',
    status: round?.status || 'draft'
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Convert datetime strings to proper format
      const submitData = {
        ...formData,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        upload_deadline: new Date(formData.upload_deadline).toISOString()
      };
      
      await onSave(submitData);
    } catch (err) {
      console.error('Error in form submission:', err);
    } finally {
      setSaving(false);
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
              <label className="form-label">Round Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={formData.start_time}
                  onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={formData.end_time}
                  onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Upload Deadline</label>
              <input
                type="datetime-local"
                className="form-input"
                value={formData.upload_deadline}
                onChange={(e) => setFormData({...formData, upload_deadline: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="draft">Draft</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
              </select>
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