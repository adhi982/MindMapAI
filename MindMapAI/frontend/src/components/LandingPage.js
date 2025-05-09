import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1>AI-Powered Mind Map Generation</h1>
          <p className="subtitle">Transform ideas into visual knowledge structures instantly</p>
          <div className="cta-buttons">
            <Link to="/generator" className="cta-button primary">Create Mind Map</Link>
            <a href="#features" className="cta-button secondary">Learn More</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="brain-network">
            <div className="network-node main">AI</div>
            <div className="network-node n1">Research</div>
            <div className="network-node n2">Knowledge</div>
            <div className="network-node n3">Connections</div>
            <div className="network-node n4">Insights</div>
            <div className="network-line l1"></div>
            <div className="network-line l2"></div>
            <div className="network-line l3"></div>
            <div className="network-line l4"></div>
          </div>
        </div>
      </div>

      <section id="features" className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Research Mode</h3>
            <p>Harness the web to build comprehensive mind maps with the latest information</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>Dual AI Processing</h3>
            <p>Powered by Gemini and Mistral AI models for optimal results</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Interactive Visualization</h3>
            <p>Zoom, pan, and explore your mind maps with intuitive controls</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Instant Generation</h3>
            <p>Create complex knowledge structures in seconds, not hours</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Enter your topic or paste text</h3>
            <p>Provide a subject or detailed text you want to explore</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Choose processing mode</h3>
            <p>Select standard mode or research mode for web-enhanced results</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Generate your mind map</h3>
            <p>Our AI analyzes and structures the information into a visual mind map</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Explore and interact</h3>
            <p>Zoom, pan, and explore your mind map to gain new insights</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to visualize your knowledge?</h2>
        <Link to="/generator" className="cta-button primary large">Create Your Mind Map Now</Link>
      </section>
    </div>
  );
};

export default LandingPage; 