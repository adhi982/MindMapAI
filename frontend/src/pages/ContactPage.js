import React from 'react';
import { Link } from 'react-router-dom';
import './Pages.css';

const ContactPage = () => {
  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Contact Us</h1>
        
        <section className="contact-intro">
          <p>
            Have questions, suggestions, or feedback? We'd love to hear from you!
          </p>
        </section>

        <div className="contact-email-container">
          <a href="mailto:adi771121@gmail.com" className="contact-email-link">
            adi771121@gmail.com
          </a>
        </div>

        <div className="contact-social-links">
          <a href="https://github.com/adhi982" target="_blank" rel="noopener noreferrer" className="contact-social-link">
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/adithya982" target="_blank" rel="noopener noreferrer" className="contact-social-link">
            LinkedIn
          </a>
        </div>

        <div className="page-navigation">
          <Link to="/" className="back-link">Return to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default ContactPage; 