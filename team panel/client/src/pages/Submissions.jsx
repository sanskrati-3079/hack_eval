import React, { useContext, useState } from 'react';
import { TeamContext } from '../context/TeamContext';
import { useDropzone } from 'react-dropzone';

const Submissions = () => {
  const { team } = useContext(TeamContext);
  const [uploading, setUploading] = useState(false);

  const onDrop = async (acceptedFiles) => {
    setUploading(true);
    // Handle file upload logic here
    setTimeout(() => {
      setUploading(false);
    }, 2000);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip'],
    },
    maxFiles: 1,
  });

  return (
    <div className="submissions-container">
      <h1>Project Submissions</h1>

      <div className="submission-upload">
        <h2>Upload Submission</h2>
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'active' : ''}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <p>Uploading...</p>
          ) : isDragActive ? (
            <p>Drop the files here...</p>
          ) : (
            <p>Drag 'n' drop your project files here, or click to select files</p>
          )}
        </div>
      </div>

      <div className="submission-history">
        <h2>Submission History</h2>
        {team?.submissions?.length > 0 ? (
          <div className="submissions-list">
            {team.submissions.map((submission, index) => (
              <div key={index} className="submission-card">
                <div className="submission-info">
                  <h3>Submission #{submission.id}</h3>
                  <p>Date: {new Date(submission.submittedAt).toLocaleString()}</p>
                  <p>Status: {submission.status}</p>
                  {submission.feedback && (
                    <div className="feedback">
                      <h4>Feedback:</h4>
                      <p>{submission.feedback}</p>
                    </div>
                  )}
                </div>
                <div className="submission-actions">
                  <button
                    onClick={() => window.open(submission.downloadUrl)}
                    className="download-btn"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No submissions yet</p>
        )}
      </div>
    </div>
  );
};

export default Submissions;