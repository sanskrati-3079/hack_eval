import React, { useContext, useState, useEffect, useCallback } from "react";
import { TeamContext } from "../context/TeamContext";
import { API_BASE_URL } from "../config";

const Submissions = () => {
  // Assuming TeamContext provides the auth token
  const { token } = useContext(TeamContext);

  // State for the submission form
  const [submissionLink, setSubmissionLink] = useState("");
  const [roundId, setRoundId] = useState(1); // Default to round 1

  // State for displaying data and UI feedback
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Function to fetch submission history
  const fetchSubmissions = useCallback(async () => {
    if (!token) return;
    const response = await fetch(`${API_BASE_URL}/user/submissions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setSubmissionHistory(data);
  }, [token]);

  // Fetch data when the component mounts
  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionLink) {
      setError("Please provide a round number and a GitHub link.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/user/submission/${roundId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ submission_link: submissionLink }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Failed to upload submission.");
      }

      setSuccessMessage("Submission uploaded successfully!");
      setSubmissionLink(""); // Clear input on success
      fetchSubmissions(); // Refresh history to show the new submission
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="submissions-container">
      <h1>Project Submissions</h1>

      <div className="submission-upload">
        <h2>Upload Submission</h2>
        <form onSubmit={handleSubmit} className="submission-form">
          <div className="form-group">
            <label htmlFor="roundId">Round Number</label>
            <input
              type="number"
              id="roundId"
              value={roundId}
              onChange={(e) => setRoundId(parseInt(e.target.value, 10))}
              min="1"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="githubLink">GitHub Repository Link</label>
            <input
              type="url"
              id="githubLink"
              placeholder="https://github.com/your-username/your-repo"
              value={submissionLink}
              onChange={(e) => setSubmissionLink(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}
          <button type="submit" disabled={uploading}>
            {uploading ? "Submitting..." : "Submit Project"}
          </button>
        </form>
      </div>

      <div className="submission-history">
        <h2>Submission History</h2>
        {isLoading ? (
          <p>Loading submission history...</p>
        ) : submissionHistory.length > 0 ? (
          <div className="submissions-list">
            {submissionHistory.map((submission) => (
              <div key={submission.id} className="submission-card">
                <div className="submission-info">
                  <h3>Round #{submission.round_id}</h3>
                  <p>
                    Date: {new Date(submission.submitted_at).toLocaleString()}
                  </p>
                  <p>
                    Status:{" "}
                    <span className={`status-${submission.status}`}>
                      {submission.status}
                    </span>
                  </p>
                  {submission.feedback && (
                    <div className="feedback">
                      <h4>Feedback:</h4>
                      <p>{submission.feedback}</p>
                    </div>
                  )}
                </div>
                <div className="submission-actions">
                  <a
                    href={submission.submission_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="download-btn" // Re-using class name from original code
                  >
                    View on GitHub
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No submissions yet.</p>
        )}
      </div>
    </div>
  );
};

export default Submissions;
