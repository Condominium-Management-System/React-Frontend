import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
      
      if (result.success) {
        const userRole = result.user?.role;
        toast.success(`Welcome back, ${result.user?.fullName || 'User'}! 🎉`);
        
        setTimeout(() => {
          if (userRole === 'super_admin') {
            navigate('/super-admin/dashboard');
          } else if (userRole === 'condo_admin') {
            navigate('/condo-admin/dashboard');
          } else {
            navigate('/resident/dashboard');
          }
        }, 800);
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
        toast.error(result.message || 'Login failed. Please check your credentials.');
        setLoading(false);
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('Network error. Please check if the server is running.');
      toast.error('Network error. Please check if the server is running.');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🏢 HomeAxis</h1>
          <p>Sign in to your account</p>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <span>{error}</span>
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
              autoComplete="email"
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
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-switch">
          <span>Don't have an account?</span>
          <Link to="/register">Register</Link>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
};

export default Login;
