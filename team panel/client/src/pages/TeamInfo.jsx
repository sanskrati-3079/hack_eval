import React, { useContext } from 'react';
import { TeamContext } from '../context/TeamContext';

const TeamInfo = () => {
  const { team } = useContext(TeamContext);

  return (
    <div className="team-info-container">
      <h1>Team Information</h1>
      {team ? (
        <div className="team-info-content">
          <div className="team-details">
            <h2>Team Details</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Team Name:</label>
                <p>{team.name}</p>
              </div>
              <div className="info-item">
                <label>Team ID:</label>
                <p>{team.teamId}</p>
              </div>
              <div className="info-item">
                <label>Project Track:</label>
                <p>{team.track}</p>
              </div>
              <div className="info-item">
                <label>Status:</label>
                <p>{team.status}</p>
              </div>
            </div>
          </div>

          <div className="team-members">
            <h2>Team Members</h2>
            <div className="members-list">
              {team.members.map((member, index) => (
                <div key={index} className="member-card">
                  <h3>{member.name}</h3>
                  <p>Role: {member.role}</p>
                  <p>Email: {member.email}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="project-info">
            <h2>Project Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Project Name:</label>
                <p>{team.project?.name || 'Not set'}</p>
              </div>
              <div className="info-item">
                <label>Description:</label>
                <p>{team.project?.description || 'Not available'}</p>
              </div>
              <div className="info-item">
                <label>Tech Stack:</label>
                <p>{team.project?.techStack?.join(', ') || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>Loading team information...</p>
      )}
    </div>
  );
};

export default TeamInfo;