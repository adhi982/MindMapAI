import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import MindMapGenerator from './components/MindMapGenerator';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthModal from './components/auth/AuthModal';
import { supabase, verifyDatabaseSetup } from './supabase';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import './App.css';

// Database setup notification component
const DatabaseSetupNotification = ({ message, onClose }) => {
  return (
    <div className="database-setup-notification">
      <div className="notification-content">
        <h3>Database Setup Required</h3>
        <p>{message}</p>
        <p>Please follow these steps:</p>
        <ol>
          <li>Go to your Supabase dashboard</li>
          <li>Open the SQL Editor</li>
          <li>Copy and paste the SQL script from <code>frontend/src/sql/api_key_functions.sql</code></li>
          <li>Run the script</li>
          <li>Refresh this page</li>
        </ol>
        <button onClick={onClose} className="close-notification">Close</button>
      </div>
    </div>
  );
};

const Header = () => {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [userProfile, setUserProfile] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    // Fetch user profile data if user is logged in
    const fetchUserProfile = async () => {
      if (user) {
        const { data: userData, error } = await supabase
          .from('users_with_email')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (!error && userData) {
          setUserProfile(userData);
        }
      }
    };
    
    fetchUserProfile();
  }, [user]);

  const handleLogin = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleSignup = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    // Call signOut directly - it handles everything and forces reload
    signOut();
  };

  // Toggle profile dropdown
  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector('.profile-dropdown-container');
      if (dropdown && !dropdown.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="logo">
          <span className="logo-icon">🧠</span>
          <span className="logo-text">MindMapAI</span>
        </Link>
        <nav className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/generator" className="nav-link">Generator</Link>
          <Link to="/about" className="nav-link">About</Link>
          <a href="https://github.com/adhi982" target="_blank" rel="noopener noreferrer" className="nav-link">
            GitHub
          </a>
          
          {user ? (
            <div className="profile-dropdown-container">
              <div 
                className="profile-icon" 
                onClick={toggleProfileDropdown}
                onMouseEnter={() => setShowProfileDropdown(true)}
              >
                <span className="profile-avatar">
                  {userProfile?.email?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
              
              <div className={`profile-dropdown ${showProfileDropdown ? 'show' : ''}`}
                   onMouseLeave={() => setShowProfileDropdown(false)}>
                <div className="profile-dropdown-content">
                  <div className="profile-email">
                    {userProfile?.email || user.email}
                  </div>
                  <button 
                    onClick={handleLogout} 
                    className="profile-logout-btn"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-nav">
              <button onClick={handleLogin} className="auth-nav-button login">
                Login
              </button>
              <button onClick={handleSignup} className="auth-nav-button signup">
                Sign Up
              </button>
            </div>
          )}
        </nav>
      </div>
      
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </header>
  );
};

function App() {
  const [dbSetupRequired, setDbSetupRequired] = useState(false);
  const [dbSetupMessage, setDbSetupMessage] = useState('');

  useEffect(() => {
    const checkDatabaseSetup = async () => {
      const { success, message } = await verifyDatabaseSetup();
      if (!success) {
        setDbSetupRequired(true);
        setDbSetupMessage(message);
      }
    };
    
    checkDatabaseSetup();

    // Add meta tag for better WebGL rendering
    const metaTag = document.createElement('meta');
    metaTag.name = 'viewport';
    metaTag.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.getElementsByTagName('head')[0].appendChild(metaTag);
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          
          <main className="app-content">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/generator" element={<MindMapGenerator />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Routes>
          </main>
          
          <footer className="app-footer">
            <div className="footer-content">
              <p className="copyright">© {new Date().getFullYear()} MindMapAI - AI-Powered Mind Map Generator</p>
              <div className="footer-links">
                <Link to="/terms" className="footer-link">Terms</Link>
                <Link to="/privacy" className="footer-link">Privacy</Link>
                <Link to="/about" className="footer-link">About</Link>
                <Link to="/contact" className="footer-link">Contact</Link>
                <a href="https://github.com/adhi982" target="_blank" rel="noopener noreferrer" className="footer-link">
                  GitHub
                </a>
              </div>
            </div>
          </footer>
          
          {dbSetupRequired && (
            <DatabaseSetupNotification 
              message={dbSetupMessage} 
              onClose={() => setDbSetupRequired(false)} 
            />
          )}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
