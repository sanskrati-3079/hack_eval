import React, { useState } from 'react';
import './RoundScheduler.css';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Upload, 
  Edit, 
  Trash2,
  Eye
} from 'lucide-react';

const RoundScheduler = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedRound, setSelectedRound] = useState(null);
  const [viewMode, setViewMode] = useState('list');

  const [rounds, setRounds] = useState([
    {
      id: 1,
      name: 'Round 1: Ideation',
      startTime: '2024-01-15T09:00:00',
      endTime: '2024-01-15T17:00:00',
      uploadDeadline: '2024-01-15T16:00:00',
      status: 'completed',
      description: 'Initial idea submission and team formation'
    },
    {
      id: 2,
      name: 'Round 2: Development',
      startTime: '2024-01-16T09:00:00',
      endTime: '2024-01-17T17:00:00',
      uploadDeadline: '2024-01-17T16:00:00',
      status: 'live',
      description: 'Core development and prototype building'
    }
  ]);

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

  const handleDeleteRound = (roundId) => {
    const round = rounds.find((r) => r.id === roundId);
    const name = round ? round.name : 'this round';
    if (!window.confirm(`Delete ${name}? This action cannot be undone.`)) return;
    setRounds((prev) => prev.filter((r) => r.id !== roundId));
  };

  // 🔹 Main Add/Edit Logic
  const handleSaveRound = (roundData) => {
    if (selectedRound) {
      // Update existing round
      setRounds((prev) =>
        prev.map((r) =>
          r.id === selectedRound.id ? { ...r, ...roundData } : r
        )
      );
    } else {
      // Add new round
      const newRound = {
        ...roundData,
        id: rounds.length ? Math.max(...rounds.map((r) => r.id)) + 1 : 1
      };
      setRounds((prev) => [...prev, newRound]);
    }
    setShowModal(false);
    setSelectedRound(null);
  };

  return (
    <div className="round-scheduler">
      <div className="page-header">
        <h1 className="page-title">Round Scheduler</h1>
        <p className="page-subtitle">Manage hackathon rounds, schedules, and deadlines</p>
      </div>

      <div className="action-bar">
        <div className="view-controls">
          <button 
            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('list')}
          >
            <Eye size={16} />
            List View
          </button>
          {/* <button 
            className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('calendar')}
          >
            <Calendar size={16} />
            Calendar View
          </button> */}
        </div>
        <button className="btn btn-primary" onClick={handleAddRound}>
          <Plus size={16} />
          Add New Round
        </button>
      </div>

      {viewMode === 'list' ? (
        <div className="rounds-list">
          {rounds.map((round) => (
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
                    <div><strong>Start:</strong> {formatDateTime(round.startTime)}</div>
                  </div>
                  <div className="detail-item">
                    <Clock size={16} />
                    <div><strong>End:</strong> {formatDateTime(round.endTime)}</div>
                  </div>
                  <div className="detail-item">
                    <Upload size={16} />
                    <div><strong>Upload Deadline:</strong> {formatDateTime(round.uploadDeadline)}</div>
                  </div>
                </div>

                <div className="round-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleEditRound(round)}
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button className="btn btn-error" onClick={() => handleDeleteRound(round.id)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
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
    startTime: round?.startTime ? round.startTime.slice(0, 16) : '',
    endTime: round?.endTime ? round.endTime.slice(0, 16) : '',
    uploadDeadline: round?.uploadDeadline ? round.uploadDeadline.slice(0, 16) : '',
    status: round?.status || 'draft'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
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
            {/* name */}
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
            {/* description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
              />
            </div>
            {/* dates */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  required
                />
              </div>
            </div>
            {/* deadline */}
            <div className="form-group">
              <label className="form-label">Upload Deadline</label>
              <input
                type="datetime-local"
                className="form-input"
                value={formData.uploadDeadline}
                onChange={(e) => setFormData({...formData, uploadDeadline: e.target.value})}
                required
              />
            </div>
            {/* status */}
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
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {round ? 'Update Round' : 'Create Round'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoundScheduler;
