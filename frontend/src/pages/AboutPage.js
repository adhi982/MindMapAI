import React from 'react';
import { Link } from 'react-router-dom';
import './Pages.css';

const AboutPage = () => {
  return (
    <div className="page-container">
      <div className="page-content">
        <h1>About MindMapAI</h1>

        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            MindMapAI was created to help people visualize and organize complex information in an intuitive way. 
            Our mission is to make knowledge more accessible and understandable through AI-powered mind mapping, 
            helping students, professionals, researchers, and curious minds to better comprehend and retain information.
          </p>
        </section>

        <section className="about-section">
          <h2>The Technology</h2>
          <p>
            MindMapAI leverages the power of multiple large language models including OpenAI's GPT, 
            Anthropic's Claude, Google's Gemini, and Cohere's Command models to analyze text and extract 
            key concepts and their relationships. These insights are then transformed into elegant, 
            structured mind maps that visually represent the information hierarchy.
          </p>
          <p>
            Our application is built on modern web technologies:
          </p>
          <ul>
            <li><strong>Frontend:</strong> React with responsive design principles</li>
            <li><strong>Visualization:</strong> Mermaid.js for rendering beautiful mind maps</li>
            <li><strong>Backend:</strong> FastAPI (Python) for efficient API processing</li>
            <li><strong>Database:</strong> Supabase PostgreSQL for secure data storage</li>
            <li><strong>Authentication:</strong> Secure user management system with Supabase Auth</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4361ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 7h-3a2 2 0 0 1-2-2V2"></path>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7l-6-5Z"></path>
                  <path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"></path>
                  <path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"></path>
                </svg>
              </div>
              <h3>Multi-Provider Support</h3>
              <p>Connect with OpenAI, Anthropic, Google, or Cohere using your own API keys</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4361ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="m4.9 4.9 14.2 14.2"></path>
                  <path d="M12 17a5 5 0 0 0 5-5c0-1.5-.5-2.8-1.4-3.9"></path>
                  <path d="M12 7a5 5 0 0 0-5 5 4.9 4.9 0 0 0 1.4 3.9"></path>
                </svg>
              </div>
              <h3>Research Mode</h3>
              <p>Enhanced mind maps with web-augmented research for deeper insights</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4361ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
              </div>
              <h3>Interactive Visualization</h3>
              <p>Explore your mind maps with intuitive zoom, pan, and navigation controls</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4361ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                </svg>
              </div>
              <h3>Instant Generation</h3>
              <p>Create complex mind maps in seconds with advanced AI processing</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Our Team</h2>
          <p>
            MindMapAI was developed by a team of passionate developers and AI enthusiasts who believe 
            in the power of visual learning and knowledge organization. We're constantly working to 
            improve the platform and add new features.
          </p>
        </section>

        <section className="about-section">
          <h2>Future Plans</h2>
          <p>
            We're committed to enhancing MindMapAI with new features and improvements, including:
          </p>
          <ul>
            <li>Collaborative mind mapping for teams</li>
            <li>Custom styling options for mind maps</li>
            <li>Integration with note-taking and productivity apps</li>
            <li>Advanced export formats and presentation tools</li>
            <li>Mobile applications for on-the-go mind mapping</li>
          </ul>
        </section>

        <div className="page-navigation">
          <Link to="/" className="back-link">Return to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 