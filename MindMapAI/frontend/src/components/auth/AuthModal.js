import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import './Auth.css';

const AuthModal = ({ isOpen, onClose, initialMode = 'login', message }) => {
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    if (isOpen) {
      // Disable body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable body scroll when modal is closed
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        {message && <div className="auth-modal-message">{message}</div>}
        
        {mode === 'login' ? (
          <LoginForm 
            onClose={onClose}
            switchToSignup={() => setMode('signup')}
          />
        ) : (
          <SignupForm 
            onClose={onClose}
            switchToLogin={() => setMode('login')}
          />
        )}
      </div>
    </div>,
    document.body
  );
};

export default AuthModal; 