// Login Component
import { useState } from 'react';
import { signIn } from '../services/authService';
import ThemeToggle from './ThemeToggle';
import Footer from './Footer';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-theme-toggle">
        <ThemeToggle />
      </div>
      <div className="login-card-wrapper">
        <div className="login-card">
          <div className="login-logo-container">
            <div className="resq-logo">RQ</div>
            <h1>ResQ</h1>
          </div>
          <h2>Field Responder Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="responder@example.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="login-note">
            Login once while online. Your session will be cached for offline use.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;

