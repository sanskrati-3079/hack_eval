import React, { useState, useRef } from 'react';
import { 
  Users, 
  Calendar, 
  Trophy, 
  UserCheck, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  RefreshCw,
  FileText,
  Database
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [lastUpdate, setLastUpdate] = useState('Never');
  const fileInputRef = useRef(null);

  const stats = [
    {
      title: 'Total Teams',
      value: '24',
      change: '+3',
      changeType: 'positive',
      icon: Users,
      color: 'var(--primary-dark)'
    },
    {
      title: 'Active Rounds',
      value: '3',
      change: '1 live',
      changeType: 'info',
      icon: Calendar,
      color: 'var(--info)'
    },
    {
      title: 'Judges Assigned',
      value: '12',
      change: '+2',
      changeType: 'positive',
      icon: UserCheck,
      color: 'var(--success)'
    },
    {
      title: 'Average Score',
      value: '8.5',
      change: '+0.3',
      changeType: 'positive',
      icon: Trophy,
      color: 'var(--warning)'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'round',
      message: 'Round 2 submissions deadline extended by 2 hours',
      time: '2 hours ago',
      status: 'info'
    },
    {
      id: 2,
      type: 'judge',
      message: 'Dr. Sarah Johnson assigned to Team Alpha',
      time: '4 hours ago',
      status: 'success'
    },
    {
      id: 3,
      type: 'score',
      message: 'Team Beta received perfect score in Round 1',
      time: '6 hours ago',
      status: 'success'
    },
    {
      id: 4,
      type: 'mentor',
      message: 'Mentor availability updated for tomorrow',
      time: '1 day ago',
      status: 'info'
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Round 2 Judging',
      time: 'Today, 2:00 PM',
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Final Presentations',
      time: 'Tomorrow, 10:00 AM',
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'Award Ceremony',
      time: 'Day after tomorrow, 4:00 PM',
      status: 'upcoming'
    }
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const lowerName = file.name.toLowerCase();
      const isExcel = lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls');
      if (isExcel) {
        setSelectedFile(file);
        setUploadStatus({ type: 'info', message: `Selected: ${file.name}` });
        return;
      }
    }
    setUploadStatus({ type: 'error', message: 'Please select a valid Excel (.xlsx or .xls) file' });
    setSelectedFile(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus({ type: 'error', message: 'Please select a file first' });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: 'info', message: 'Uploading and updating database...' });

    try {
      const formData = new FormData();
      // Backend expects field name "file"
      formData.append('file', selectedFile);

      const response = await fetch('/api/upload-ppt-report', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus({ 
          type: 'success', 
          message: `Successfully updated! ${result.total_records} records processed.` 
        });
        setLastUpdate(new Date().toLocaleString());
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setUploadStatus({ 
          type: 'error', 
          message: result.detail || result.error || 'Upload failed. Please try again.' 
        });
      }
    } catch (error) {
      setUploadStatus({ 
        type: 'error', 
        message: 'Network error. Please check your connection.' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRefresh = () => {
    setUploadStatus(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here's what's happening with your hackathon.</p>
      </div>

      {/* PPT Report Update Section */}
      <div className="ppt-update-section">
        <div className="section-header">
          <h2 className="section-title">
            <FileText className="section-icon" />
            PPT Report Management
          </h2>
          <div className="last-update">
            Last updated: {lastUpdate}
          </div>
        </div>
        
        <div className="upload-container">
          <div className="file-input-wrapper">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="file-input"
              id="ppt-file-input"
            />
            <label htmlFor="ppt-file-input" className="file-input-label">
              <Upload className="upload-icon" />
              {selectedFile ? selectedFile.name : 'Choose PPT Report Excel File'}
            </label>
          </div>
          
          <div className="upload-actions">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className={`upload-btn ${isUploading ? 'uploading' : ''}`}
            >
              {isUploading ? (
                <>
                  <RefreshCw className="spinning" />
                  Updating Database...
                </>
              ) : (
                <>
                  <Database className="btn-icon" />
                  Update Database
                </>
              )}
            </button>
            
            <button
              onClick={handleRefresh}
              className="refresh-btn"
              title="Clear selection"
            >
              <RefreshCw className="btn-icon" />
            </button>
          </div>
        </div>

        {uploadStatus && (
          <div className={`status-message ${uploadStatus.type}`}>
            <div className="status-content">
              {uploadStatus.type === 'success' && <CheckCircle className="status-icon" />}
              {uploadStatus.type === 'error' && <AlertCircle className="status-icon" />}
              {uploadStatus.type === 'info' && <AlertCircle className="status-icon" />}
              <span>{uploadStatus.message}</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
            <div className="stat-icon" style={{ color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-title">{stat.title}</h3>
              <div className="stat-value">{stat.value}</div>
              <div className={`stat-change ${stat.changeType}`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Recent Activities */}
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">
              <Clock className="card-icon" />
              Recent Activities
            </h3>
          </div>
          <div className="card-content">
            {recentActivities.map((activity) => (
              <div key={activity.id} className={`activity-item ${activity.status}`}>
                <div className="activity-message">{activity.message}</div>
                <div className="activity-time">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">
              <Calendar className="card-icon" />
              Upcoming Events
            </h3>
          </div>
          <div className="card-content">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="event-item">
                <div className="event-title">{event.title}</div>
                <div className="event-time">{event.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 