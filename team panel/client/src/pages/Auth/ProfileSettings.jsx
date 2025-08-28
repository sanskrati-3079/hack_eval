import React, { useState, useContext } from 'react';
import { TeamContext } from '../../context/TeamContext';
import toast from 'react-hot-toast';
import './Auth.css';

const ProfileSettings = () => {
  const { team, setTeam } = useContext(TeamContext);
  const [formData, setFormData] = useState({
    teamName: team?.name || '',
    projectName: team?.project?.name || '',
    projectDescription: team?.project?.description || '',
    track: team?.track || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Update team data
    const updatedTeam = {
      ...team,
      name: formData.teamName,
      track: formData.track,
      project: {
        ...team.project,
        name: formData.projectName,
        description: formData.projectDescription
      }
    };
    
    // Update localStorage and context
    localStorage.setItem('team', JSON.stringify(updatedTeam));
    setTeam(updatedTeam);
    toast.success('Profile updated successfully');
  };

  return (
    <div className="auth-container">
      <div className="auth-card wide">
        <h2>Profile Settings</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Team Information</h3>
            <div className="form-group">
              <label>Team Name</label>
              <input
                type="text"
                name="teamName"
                value={formData.teamName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Track</label>
              <select
                name="track"
                value={formData.track}
                onChange={handleChange}
                required
              >
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="AI/ML">AI/ML</option>
                <option value="Blockchain">Blockchain</option>
                <option value="IoT">IoT</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>Project Details</h3>
            <div className="form-group">
              <label>Project Name</label>
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Project Description</label>
              <textarea
                name="projectDescription"
                value={formData.projectDescription}
                onChange={handleChange}
                rows="4"
                required
              />
            </div>
          </div>

          <button type="submit" className="auth-button">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
