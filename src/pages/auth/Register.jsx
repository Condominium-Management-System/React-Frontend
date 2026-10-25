import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/axiosConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [condos, setCondos] = useState([]);
  const [loadingCondos, setLoadingCondos] = useState(true);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    fan: '',
    condoCode: '',
    block: '',
    roomNo: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch available active condominiums
  useEffect(() => {
    const fetchCondos = async () => {
      try {
        setLoadingCondos(true);
        const res = await api.condos.getAll();
        const list = res.data?.data || res.data || [];
        setCondos(Array.isArray(list) ? list : []);
        if (list.length > 0) {
          setFormData((prev) => ({ ...prev, condoCode: list[0].condoCode }));
        }
      } catch (err) {
        console.error('Failed to fetch condominiums:', err);
      } finally {
        setLoadingCondos(false);
      }
    };
    fetchCondos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const cleanPhone = formData.phoneNumber.trim();
    const phoneValid = /^(09|07)\d{8}$|^\+251[79]\d{8}$/.test(cleanPhone);
    if (!phoneValid) {
      setError('Phone number must start with 09 or 07 (10 digits) or +251 (12 digits).');
      return;
    }

    const cleanFan = formData.fan.trim();
    if (!/^\d{16}$/.test(cleanFan)) {
      setError('National ID (FAN) must be exactly 16 digits.');
      return;
    }

    if (!formData.condoCode) {
      setError('Please select your condominium.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: cleanPhone,
        fan: cleanFan,
        condoCode: formData.condoCode,
        block: formData.block.trim() || undefined,
        roomNo: formData.roomNo.trim() || undefined,
        password: formData.password,
        role: 'resident',
      };

      const res = await api.auth.register(payload);
      
      if (res.data?.success || res.status === 201) {
        toast.success('Registration successful! Signing you in... 🎉');

        // Automatically log in newly created user
        const loginRes = await login({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        });

        if (loginRes.success) {
          setTimeout(() => {
            navigate('/resident/dashboard');
          }, 1000);
        } else {
          toast.info('Account created! Please sign in with your credentials.');
          setTimeout(() => {
            navigate('/login');
          }, 1500);
        }
      } else {
        setError(res.data?.message || 'Registration failed');
        toast.error(res.data?.message || 'Registration failed');
        setLoading(false);
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please check your information.';
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card register-card">
        <div className="login-header">
          <h1>🏢 HomeAxis</h1>
          <p>Create your account</p>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Abebe Bikila"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="0911223344 or +251..."
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>National ID / FAN (16 Digits) *</label>
              <input
                type="text"
                name="fan"
                maxLength={16}
                value={formData.fan}
                onChange={handleChange}
                placeholder="16-digit National ID number"
                required
              />
            </div>

            <div className="form-group">
              <label>Select Condominium *</label>
              <select
                name="condoCode"
                value={formData.condoCode}
                onChange={handleChange}
                required
                disabled={loadingCondos}
              >
                {condos.map((c) => (
                  <option key={c.id} value={c.condoCode}>
                    {c.condoName} ({c.condoCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Block / Wing (Optional)</label>
              <input
                type="text"
                name="block"
                value={formData.block}
                onChange={handleChange}
                placeholder="e.g. Block A"
              />
            </div>

            <div className="form-group">
              <label>Room / Unit No (Optional)</label>
              <input
                type="text"
                name="roomNo"
                value={formData.roomNo}
                onChange={handleChange}
                placeholder="e.g. Unit 204"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 characters"
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Creating your account...' : 'Register'}
          </button>
        </form>

        <div className="auth-switch">
          <span>Already have an account?</span>
          <Link to="/login">Sign In</Link>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
};

export default Register;
