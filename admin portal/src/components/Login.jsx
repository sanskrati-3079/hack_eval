import React, { useState } from 'react';
import { Lock, Mail } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    // Simple demo auth: accept any non-empty values
    if (email.trim() && password.trim()) {
      onLogin({ email });
    } else {
      setError('Please enter email and password');
    }
  };

  return (
    <div className="auth-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: 420 }}>
        <div className="card-header">
          <h3>Admin Login</h3>
          <p className="page-subtitle">Use your credentials to continue</p>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="search-input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={18} className="search-icon" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="search-input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lock size={18} className="search-icon" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>
            <div className="action-buttons" style={{ marginTop: 12 }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Log In</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;


