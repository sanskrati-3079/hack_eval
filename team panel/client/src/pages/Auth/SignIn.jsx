import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { TeamContext } from "../../context/TeamContext";
import toast from "react-hot-toast";
import "./Auth.css";
import { API_BASE_URL } from "../../config";
import HeaderSignIn from "./Header_SignIn";

const SignIn = () => {
  const navigate = useNavigate();
  const { setTeam } = useContext(TeamContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/team/team_login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save to localStorage and context
      localStorage.setItem("team", JSON.stringify(data.data.team));
      localStorage.setItem("token", data.data.accessToken);
      setTeam(data.data.team);
      
      toast.success("Signed in successfully");
      navigate("/");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HeaderSignIn />
      <div className="auth-container">
        <div className="auth-card">
          <h2>Team Sign In</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <div className="form-group">
                <label>Email ID</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your official team leader email id"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <p className="auth-link">
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignIn;