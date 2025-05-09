import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const LoginForm = ({ onClose, switchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, transferAnonymousUsage } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { success, data, error } = await signIn(email, password);
      
      if (!success) {
        throw error || new Error('Failed to sign in');
      }
      
      // Transfer anonymous usage to the user account
      if (data?.user) {
        await transferAnonymousUsage(data.user.id);
      }
      
      // Close the form on successful login
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <h2>Login</h2>
        <p className="auth-description">Log in to use more features and track your generations</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>
            Don't have an account?{' '}
            <button 
              type="button" 
              className="auth-link-button" 
              onClick={switchToSignup}
            >
              Sign up
            </button>
          </p>
        </div>
        
        <button 
          type="button" 
          className="auth-close-button" 
          onClick={onClose}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default LoginForm; 