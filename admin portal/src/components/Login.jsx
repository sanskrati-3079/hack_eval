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
//     <div className="auth-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
//       <div className="card" style={{ width: '100%', maxWidth: 420 }}>
//         <div className="card-header">
//           <h3>Admin Login</h3>
//           <p className="page-subtitle">Use your credentials to continue</p>
          
//           {/* User Type Selection - Simple radio buttons */}
//           <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
//             <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
//               <input
//                 type="radio"
//                 value="admin"
//                 checked={userType === 'admin'}
//                 onChange={(e) => setUserType(e.target.value)}
//               />
//               Admin
//             </label>
//             <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
//               <input
//                 type="radio"
//                 value="judge"
//                 checked={userType === 'judge'}
//                 onChange={(e) => setUserType(e.target.value)}
//               />
//               Judge
//             </label>
//             <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
//               <input
//                 type="radio"
//                 value="team"
//                 checked={userType === 'team'}
//                 onChange={(e) => setUserType(e.target.value)}
//               />
//               Team
//             </label>
//           </div>
//         </div>
//         <div className="card-body">
//           {error && (
//             <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>
//           )}
//           <form onSubmit={handleSubmit}>
//             <div className="form-group">
//               <label className="form-label">
//                 {userType === 'judge' ? 'Username' : 'Email'}
//               </label>
//               <div className="search-input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                 <Mail size={18} className="search-icon" />
//                 <input
//                   type={userType === 'judge' ? 'text' : 'email'}
//                   placeholder={userType === 'judge' ? 'judge_username' : 'you@example.com'}
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="form-input"
//                   required
//                 />
//               </div>
//             </div>
//             <div className="form-group">
//               <label className="form-label">Password</label>
//               <div className="search-input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                 <Lock size={18} className="search-icon" />
//                 <input
//                   type="password"
//                   placeholder="••••••••"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="form-input"
//                   required
//                 />
//               </div>
//             </div>
//             <div className="action-buttons" style={{ marginTop: 12 }}>
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

//           {userType === 'admin' && (
//   <div style={{ marginTop: '16px', textAlign: 'center' }}>
//     <p>Need an admin account? <a href="/admin-signup" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Create one here</a></p>
//   </div>
// )}

//           {/* Demo credentials hint */}
//           <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '6px', fontSize: '14px' }}>
//             <p><strong>Demo Credentials:</strong></p>
//             <p>Admin: admin@example.com / admin123</p>
//             <p>Judge: judge1 / judge123</p>
//             <p>Team: team@example.com / team123</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;



import React, { useState } from 'react';
import { Lock, Mail, Loader } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('admin'); // Default to admin

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let endpoint, payload;
      
      // Determine which endpoint to call based on user type
      if (userType === 'admin') {
        endpoint = '/admin/login';
        payload = { email, password };
      } else if (userType === 'judge') {
        endpoint = '/judge/login';
        // For judge login, we need to use form data format
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);
        payload = formData;
      } else {
        endpoint = '/team_login';
        payload = { email, password };
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: userType === 'judge' 
          ? {} // FormData sets content-type automatically
          : { 'Content-Type': 'application/json' },
        body: userType === 'judge' ? payload : JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Login failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      // Store token and user info
      localStorage.setItem('authToken', data.access_token);
      localStorage.setItem('userType', userType);
      localStorage.setItem('userEmail', email);
      
      // Call the parent callback with user info
      onLogin({ 
        email, 
        userType,
        token: data.access_token 
      });
      
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div className="card" style={{ 
        width: '100%', 
        maxWidth: '420px',
        margin: '0 auto'
      }}>
        <div className="card-header">
          <h3>Admin Login</h3>
          <p className="page-subtitle">Use your credentials to continue</p>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '12px' }}>{error}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="search-input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={18} className="search-icon" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="search-input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={18} className="search-icon" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  required
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div className="action-buttons" style={{ marginTop: '12px' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;