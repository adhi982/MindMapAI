import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const SignupForm = ({ onClose, switchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { success, error } = await signUp(email, password);
      
      if (!success) {
        throw error || new Error('Failed to sign up');
      }
      
      // Show success message
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <h2>Sign Up</h2>
        <p className="auth-description">Create an account to use unlimited generations</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        {success ? (
          <div className="auth-success">
            <h3>Registration Successful!</h3>
            <p>Please check your email to confirm your account.</p>
            <button 
              type="button" 
              className="auth-button" 
              onClick={switchToLogin}
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            
            <div className="auth-field">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Create a password"
              />
            </div>
            
            <div className="auth-field">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your password"
              />
            </div>
            
            <button 
              type="submit" 
              className="auth-button" 
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        )}
        
        <div className="auth-links">
          <p>
            Already have an account?{' '}
            <button 
              type="button" 
              className="auth-link-button" 
              onClick={switchToLogin}
            >
              Login
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

export default SignupForm; 