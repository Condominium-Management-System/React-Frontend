import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login({ email, password });
      console.log('✅ Login result:', result);
      
      if (result.success) {
        toast.success('Login successful! 🎉');
        
        // Check role and redirect accordingly
        const userRole = result.user?.role;
        console.log('👤 User role:', userRole);
        
        setTimeout(() => {
          if (userRole === 'super_admin') {
            navigate('/super-admin/dashboard');
          } else if (userRole === 'condo_admin') {
            navigate('/condo-admin/dashboard');
          } else if (userRole === 'guard') {
            navigate('/guard/dashboard');
          } else {
            navigate('/resident/dashboard');
          }
        }, 1000);
      } else {
        setError(result.message || 'Login failed');
        toast.error(result.message || 'Login failed. Please check your credentials.');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError('Network error. Please try again.');
      toast.error('Network error. Please check if the server is running.');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🏢 Home Axis</h1>
          <p>Admin Dashboard </p>
        </div>
        
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        
      </div>
      <ToastContainer position="top-right" />
    </div>
  );
};

export default Login;
