import React, { useState, useContext } from 'react';
import { TeamContext } from '../context/TeamContext';

const Mentors = () => {
  const { team } = useContext(TeamContext);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Simulated available mentors data
  const mentors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      expertise: ['AI/ML', 'Data Science'],
      availability: ['2024-02-20 10:00', '2024-02-20 14:00'],
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 2,
      name: 'Prof. Michael Chen',
      expertise: ['Web Development', 'Cloud Architecture'],
      availability: ['2024-02-21 11:00', '2024-02-21 15:00'],
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      expertise: ['UI/UX Design', 'Product Management'],
      availability: ['2024-02-22 09:00', '2024-02-22 13:00'],
      image: 'https://via.placeholder.com/150',
    },
  ];

  const handleSlotSelection = (mentorId, slot) => {
    setSelectedSlot({ mentorId, slot });
    // Handle booking logic here
  };

  return (
    <div className="mentors-container">
      <h1>Mentor Sessions</h1>

      <div className="mentors-grid">
        {mentors.map((mentor) => (
          <div key={mentor.id} className="mentor-card">
            <img src={mentor.image} alt={mentor.name} className="mentor-image" />
            <div className="mentor-info">
              <h2>{mentor.name}</h2>
              <div className="expertise">
                <h3>Expertise:</h3>
                <div className="tags">
                  {mentor.expertise.map((skill, index) => (
                    <span key={index} className="tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="availability">
                <h3>Available Slots:</h3>
                <div className="slots">
                  {mentor.availability.map((slot, index) => (
                    <button
                      key={index}
                      className={`slot-btn ${selectedSlot?.mentorId === mentor.id && selectedSlot?.slot === slot ? 'selected' : ''}`}
                      onClick={() => handleSlotSelection(mentor.id, slot)}
                    >
                      {new Date(slot).toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="booked-sessions">
        <h2>Your Booked Sessions</h2>
        {team?.mentorSessions?.length > 0 ? (
          <div className="sessions-list">
            {team.mentorSessions.map((session, index) => (
              <div key={index} className="session-card">
                <h3>Session with {session.mentorName}</h3>
                <p>Date: {new Date(session.datetime).toLocaleString()}</p>
                <p>Status: {session.status}</p>
                {session.meetingLink && (
                  <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="meeting-link">
                    Join Meeting
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No sessions booked yet</p>
        )}
      </div>
    </div>
  );
};

export default Mentors;