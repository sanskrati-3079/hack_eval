

///////// login python backend



// import React, { useState } from 'react';
// import { Lock, Mail, Loader } from 'lucide-react';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// const Login = ({ onLogin }) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [userType, setUserType] = useState('admin'); // Default to admin

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       let endpoint, payload;
      
//       // Determine which endpoint to call based on user type
//       if (userType === 'admin') {
//         endpoint = '/admin/login';
//         payload = { email, password };
//       } else if (userType === 'judge') {
//         endpoint = '/judge/login';
//         // For judge login, we need to use form data format
//         const formData = new FormData();
//         formData.append('username', email);
//         formData.append('password', password);
//         payload = formData;
//       } else {
//         endpoint = '/team_login';
//         payload = { email, password };
//       }

//       const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//         method: 'POST',
//         headers: userType === 'judge' 
//           ? {} // FormData sets content-type automatically
//           : { 'Content-Type': 'application/json' },
//         body: userType === 'judge' ? payload : JSON.stringify(payload),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.detail || `Login failed with status: ${response.status}`);
//       }

//       const data = await response.json();
      
//       // Store token and user info
//       localStorage.setItem('authToken', data.access_token);
//       localStorage.setItem('userType', userType);
//       localStorage.setItem('userEmail', email);
      
//       // Call the parent callback with user info
//       onLogin({ 
//         email, 
//         userType,
//         token: data.access_token 
//       });
      
//     } catch (err) {
//       setError(err.message || 'Login failed. Please check your credentials.');
//       console.error('Login error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-page" style={{ 
//       display: 'flex', 
//       alignItems: 'center', 
//       justifyContent: 'center', 
//       minHeight: '100vh',
//       padding: '20px'
//     }}>
//       <div className="card" style={{ 
//         width: '100%', 
//         maxWidth: '420px',
//         margin: '0 auto'
//       }}>
//         <div className="card-header">
//           <h3>Admin Login</h3>
//           <p className="page-subtitle">Use your credentials to continue</p>
//         </div>
//         <div className="card-body">
//           {error && (
//             <div className="alert alert-error" style={{ marginBottom: '12px' }}>{error}</div>
//           )}
//           <form onSubmit={handleSubmit}>
//             <div className="form-group">
//               <label className="form-label">Email</label>
//               <div className="search-input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                 <Mail size={18} className="search-icon" />
//                 <input
//                   type="email"
//                   placeholder="you@example.com"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="form-input"
//                   required
//                   style={{ width: '100%' }}
//                 />
//               </div>
//             </div>
//             <div className="form-group">
//               <label className="form-label">Password</label>
//               <div className="search-input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                 <Lock size={18} className="search-icon" />
//                 <input
//                   type="password"
//                   placeholder="••••••••"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="form-input"
//                   required
//                   style={{ width: '100%' }}
//                 />
//               </div>
//             </div>
//             <div className="action-buttons" style={{ marginTop: '12px' }}>
//               <button 
//                 type="submit" 
//                 className="btn btn-primary" 
//                 style={{ width: '100%' }}
//                 disabled={loading}
//               >
//                 {loading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
//                 {loading ? 'Logging in...' : 'Log In'}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;



















//////////////////// backend node js 





import React, { useState } from 'react';
import { Lock, Mail, Loader, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const AdminLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Login failed');
      }

      // Extract data from the response structure
      const responseData = data.data || data;
      const { accessToken, refreshToken, user } = responseData;

      if (!accessToken) {
        throw new Error('No access token received from server');
      }

      // Store tokens and user info
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken || '');
      localStorage.setItem('authUser', JSON.stringify(user || { email: formData.email }));
      localStorage.setItem('userType', 'admin');
      localStorage.setItem('userEmail', formData.email);
      
      // Call the parent callback with user info
      onLogin({ 
        email: formData.email, 
        userType: 'admin',
        token: accessToken,
        ...(user || {})
      });
      
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-card" style={{ 
      maxWidth: '400px', 
      margin: '2rem auto',
      padding: '2rem'
    }}>
      <div className="page-header">
        <h3 className="page-title">Admin Login</h3>
        <p className="page-subtitle">Use your credentials to continue</p>
      </div>
      
      {error && (
        <div style={{ 
          padding: '12px 16px', 
          backgroundColor: '#fee', 
          color: '#c33', 
          border: '1px solid #fcc',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label className="form-label">Email</label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#666' 
            }} />
            <input
              type="email"
              name="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              required
              style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#666' 
            }} />
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              required
              style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
        </div>
        
        <div className="action-buttons" style={{ marginTop: '16px' }}>
          <button 
            type="submit" 
            className="btn-upload" 
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </div>
      </form>

      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <p style={{ marginBottom: '8px', color: '#666' }}>Don't have an admin account?</p>
        <button 
          type="button" 
          className="btn-upload" 
          style={{ 
            width: '100%', 
            justifyContent: 'center',
            backgroundColor: 'transparent',
            color: '#667eea',
            border: '1px solid #667eea'
          }}
          onClick={() => window.location.href = '/admin-signup'}
        >
          Create Admin Account
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;