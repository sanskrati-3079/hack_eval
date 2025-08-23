import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

const MentorManagement = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [newTeamNameByMentorId, setNewTeamNameByMentorId] = useState({});

  const [mentors, setMentors] = useState(() => {
    try {
      const saved = localStorage.getItem('mentors');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+1 (555) 123-4567',
      expertise: ['AI/ML', 'Data Science'],
      availability: true,
      status: 'active',
      location: 'San Francisco, CA',
      bio: 'Senior AI researcher with 10+ years of experience in machine learning and data science.',
      assignedTeams: ['Team Alpha', 'Team Delta'],
      totalTeams: 2,
      rating: 4.8,
      sessions: 15
    },
    {
      id: 2,
      name: 'Prof. Robert Chen',
      email: 'robert.chen@example.com',
      phone: '+1 (555) 234-5678',
      expertise: ['Mobile App', 'UI/UX'],
      availability: true,
      status: 'active',
      location: 'New York, NY',
      bio: 'Mobile app development expert specializing in iOS and Android development.',
      assignedTeams: ['Team Gamma'],
      totalTeams: 1,
      rating: 4.9,
      sessions: 12
    },
    {
      id: 3,
      name: 'Dr. Emily Davis',
      email: 'emily.davis@example.com',
      phone: '+1 (555) 345-6789',
      expertise: ['Web Development', 'Full Stack'],
      availability: false,
      status: 'busy',
      location: 'Austin, TX',
      bio: 'Full-stack developer with expertise in modern web technologies.',
      assignedTeams: ['Team Beta'],
      totalTeams: 1,
      rating: 4.7,
      sessions: 8
    },
    {
      id: 4,
      name: 'Prof. Michael Wilson',
      email: 'michael.wilson@example.com',
      phone: '+1 (555) 456-7890',
      expertise: ['IoT', 'Hardware'],
      availability: true,
      status: 'active',
      location: 'Seattle, WA',
      bio: 'IoT specialist with background in embedded systems and hardware design.',
      assignedTeams: [],
      totalTeams: 0,
      rating: 4.6,
      sessions: 5
    }
    ];
  });

  const categories = ['all', 'AI/ML', 'Web Development', 'Mobile App', 'IoT', 'Data Science', 'UI/UX', 'Full Stack', 'Hardware'];

  const filteredMentors = mentors.filter(mentor => {
    const matchesCategory = selectedCategory === 'all' || 
                          mentor.expertise.some(exp => exp === selectedCategory);
    const matchesStatus = selectedStatus === 'all' || mentor.status === selectedStatus;
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success">Active</span>;
      case 'busy':
        return <span className="badge badge-warning">Busy</span>;
      case 'inactive':
        return <span className="badge badge-error">Inactive</span>;
      default:
        return <span className="badge badge-warning">Busy</span>;
    }
  };

  const getAvailabilityBadge = (availability) => {
    return availability ? 
      <span className="badge badge-success">Available</span> : 
      <span className="badge badge-error">Unavailable</span>;
  };

  const handleAddMentor = () => {
    setSelectedMentor(null);
    setShowMentorModal(true);
  };

  const handleEditMentor = (mentor) => {
    setSelectedMentor(mentor);
    setShowMentorModal(true);
  };

  const toggleAvailability = (mentorId) => {
    setMentors((prev) =>
      prev.map((m) => (m.id === mentorId ? { ...m, availability: !m.availability } : m))
    );
  };

  const handleAddAssignedTeam = (mentorId) => {
    const rawName = (newTeamNameByMentorId[mentorId] || '').trim();
    if (!rawName) return;
    setMentors((prev) =>
      prev.map((m) => {
        if (m.id !== mentorId) return m;
        const existingLc = (m.assignedTeams || []).map((t) => t.toLowerCase());
        if (existingLc.includes(rawName.toLowerCase())) return m;
        const updatedTeams = [...(m.assignedTeams || []), rawName];
        return { ...m, assignedTeams: updatedTeams, totalTeams: updatedTeams.length };
      })
    );
    setNewTeamNameByMentorId((prev) => ({ ...prev, [mentorId]: '' }));
  };

  const handleRemoveAssignedTeam = (mentorId, teamName) => {
    if (!window.confirm(`Remove team "${teamName}" from this mentor?`)) return;
    setMentors((prev) =>
      prev.map((m) => {
        if (m.id !== mentorId) return m;
        const updatedTeams = (m.assignedTeams || []).filter((t) => t !== teamName);
        return { ...m, assignedTeams: updatedTeams, totalTeams: updatedTeams.length };
      })
    );
  };

  useEffect(() => {
    try {
      localStorage.setItem('mentors', JSON.stringify(mentors));
    } catch {}
  }, [mentors]);

  const handleSaveMentor = (mentorData) => {
    if (selectedMentor) {
      // Update existing mentor
      setMentors((prev) =>
        prev.map((m) =>
          m.id === selectedMentor.id
            ? {
                ...m,
                ...mentorData
              }
            : m
        )
      );
    } else {
      // Add new mentor
      const nextId = mentors.length ? Math.max(...mentors.map((m) => m.id)) + 1 : 1;
      const newMentor = {
        id: nextId,
        assignedTeams: [],
        totalTeams: mentorData.totalTeams ?? 0,
        rating: mentorData.rating ?? 0,
        sessions: mentorData.sessions ?? 0,
        ...mentorData
      };
      setMentors((prev) => [newMentor, ...prev]);
    }
    setShowMentorModal(false);
    setSelectedMentor(null);
  };

  const handleRemoveMentor = (mentorId) => {
    const mentor = mentors.find((m) => m.id === mentorId);
    const name = mentor ? mentor.name : 'this mentor';
    if (!window.confirm(`Remove ${name}? This action cannot be undone.`)) return;
    setMentors((prev) => prev.filter((m) => m.id !== mentorId));
    if (selectedMentor?.id === mentorId) {
      setSelectedMentor(null);
    }
  };

  return (
    <div className="mentor-management">
      <div className="page-header">
        <h1 className="page-title">Mentor Management</h1>
        <p className="page-subtitle">Manage mentor profiles, availability, and team assignments</p>
      </div>

      {/* Statistics Overview */}
      <div className="stats-overview">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon" style={{ backgroundColor: 'var(--primary-dark)20', color: 'var(--primary-dark)' }}>
                <UserCheck size={24} />
              </div>
              <h3>Total Mentors</h3>
            </div>
            <div className="card-value">
              <span className="value">{mentors.length}</span>
              <span className="change">Registered</span>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon" style={{ backgroundColor: 'var(--success)20', color: 'var(--success)' }}>
                <CheckCircle size={24} />
              </div>
              <h3>Available Mentors</h3>
            </div>
            <div className="card-value">
              <span className="value">{mentors.filter(m => m.availability).length}</span>
              <span className="change positive">Active</span>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon" style={{ backgroundColor: 'var(--info)20', color: 'var(--info)' }}>
                <Users size={24} />
              </div>
              <h3>Assigned Teams</h3>
            </div>
            <div className="card-value">
              <span className="value">{mentors.reduce((sum, m) => sum + m.totalTeams, 0)}</span>
              <span className="change">Teams</span>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon" style={{ backgroundColor: 'var(--warning)20', color: 'var(--warning)' }}>
                <Clock size={24} />
              </div>
              <h3>Total Sessions</h3>
            </div>
            <div className="card-value">
              <span className="value">{mentors.reduce((sum, m) => sum + m.sessions, 0)}</span>
              <span className="change">Conducted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="action-bar">
        <div className="filters">
          <div className="filter-group">
            <label className="form-label">Expertise</label>
            <select 
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="form-label">Status</label>
            <select 
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="busy">Busy</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="form-label">Search</label>
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="form-input"
                placeholder="Search mentors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn btn-primary" onClick={handleAddMentor}>
            <Plus size={16} />
            Add Mentor
          </button>
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="mentors-grid">
        {filteredMentors.map((mentor) => (
          <div key={mentor.id} className="mentor-card card">
            <div className="card-body">
              <div className="mentor-header">
                <div className="mentor-avatar">
                  <span>{mentor.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div className="mentor-info">
                  <h3 className="mentor-name">{mentor.name}</h3>
                  <p className="mentor-title">{mentor.expertise.join(', ')}</p>
                  <div className="mentor-status">
                    {getStatusBadge(mentor.status)}
                    {getAvailabilityBadge(mentor.availability)}
                  </div>
                </div>
                <div className="mentor-actions">
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleEditMentor(mentor)}
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button className="btn btn-error btn-sm" onClick={() => handleRemoveMentor(mentor.id)}>
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>
              </div>

              <div className="mentor-details">
                <div className="contact-info">
                  <div className="contact-item">
                    <Mail size={14} />
                    <span>{mentor.email}</span>
                  </div>
                  <div className="contact-item">
                    <Phone size={14} />
                    <span>{mentor.phone}</span>
                  </div>
                  <div className="contact-item">
                    <MapPin size={14} />
                    <span>{mentor.location}</span>
                  </div>
                </div>

                <div className="mentor-bio">
                  <p>{mentor.bio}</p>
                </div>

                {/* Removed rating, sessions, and teams stats from mentor card as requested */}

                <div className="assigned-teams">
                  <h4>Assigned Teams</h4>
                  {mentor.assignedTeams.length > 0 && (
                    <div className="team-tags">
                      {mentor.assignedTeams.map((team, index) => (
                        <span key={index} className="team-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          {team}
                          <button
                            className="btn btn-error btn-sm"
                            style={{ padding: '2px 6px' }}
                            title="Remove team"
                            onClick={() => handleRemoveAssignedTeam(mentor.id, team)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="add-team-row" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Add team name..."
                      value={newTeamNameByMentorId[mentor.id] || ''}
                      onChange={(e) => setNewTeamNameByMentorId((prev) => ({ ...prev, [mentor.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddAssignedTeam(mentor.id);
                        }
                      }}
                      style={{ flex: 1 }}
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAddAssignedTeam(mentor.id)}
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="availability-toggle">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={mentor.availability}
                      onChange={() => toggleAvailability(mentor.id)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className="toggle-label">
                    {mentor.availability ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mentor Modal */}
      {showMentorModal && (
        <MentorModal
          mentor={selectedMentor}
          onClose={() => setShowMentorModal(false)}
          onSave={handleSaveMentor}
        />
      )}
    </div>
  );
};

// Mentor Modal Component
const MentorModal = ({ mentor, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: mentor?.name || '',
    email: mentor?.email || '',
    phone: mentor?.phone || '',
    location: mentor?.location || '',
    bio: mentor?.bio || '',
    expertise: mentor?.expertise || [],
    availability: mentor?.availability ?? true,
    status: mentor?.status || 'active',
    totalTeams: mentor?.totalTeams ?? 0,
    rating: mentor?.rating ?? 0,
    sessions: mentor?.sessions ?? 0
  });

  const expertiseOptions = ['AI/ML', 'Web Development', 'Mobile App', 'IoT', 'Data Science', 'UI/UX', 'Full Stack', 'Hardware'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleExpertiseChange = (expertise) => {
    const updatedExpertise = formData.expertise.includes(expertise)
      ? formData.expertise.filter(exp => exp !== expertise)
      : [...formData.expertise, expertise];
    setFormData({ ...formData, expertise: updatedExpertise });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {mentor ? 'Edit Mentor' : 'Add New Mentor'}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Enter location"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                className="form-input"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Enter mentor bio and experience..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Areas of Expertise</label>
              <div className="expertise-checkboxes">
                {expertiseOptions.map((expertise) => (
                  <label key={expertise} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.expertise.includes(expertise)}
                      onChange={() => handleExpertiseChange(expertise)}
                    />
                    <span className="checkmark"></span>
                    {expertise}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="busy">Busy</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Availability</label>
                <div className="availability-toggle">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={formData.availability}
                      onChange={(e) => setFormData({...formData, availability: e.target.checked})}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className="toggle-label">
                    {formData.availability ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {mentor ? 'Update Mentor' : 'Add Mentor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MentorManagement; 