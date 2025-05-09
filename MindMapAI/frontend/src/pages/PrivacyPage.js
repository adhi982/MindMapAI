import React from 'react';
import { Link } from 'react-router-dom';
import './Pages.css';

const PrivacyPage = () => {
  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: May 10, 2025</p>

        <section className="terms-section">
          <h2>1. Introduction</h2>
          <p>
            At MindMapAI, we take your privacy seriously. This Privacy Policy explains how we 
            collect, use, disclose, and safeguard your information when you use our website
            and services.
          </p>
          <p>
            Please read this Privacy Policy carefully. By accessing or using our service, you 
            acknowledge that you have read, understood, and agree to be bound by all the terms 
            outlined in this Privacy Policy.
          </p>
        </section>

        <section className="terms-section">
          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Personal Information</h3>
          <p>We may collect personal information that you voluntarily provide to us when you:</p>
          <ul>
            <li>Register for an account</li>
            <li>Sign up for our newsletter</li>
            <li>Contact us with inquiries</li>
            <li>Participate in surveys or promotions</li>
          </ul>
          <p>The personal information we collect may include:</p>
          <ul>
            <li>Email address</li>
            <li>Name (if provided)</li>
            <li>Usage data and preferences</li>
          </ul>
          
          <h3>2.2 API Keys</h3>
          <p>
            Our service allows you to store API keys for various AI service providers. We 
            implement strong security measures to protect these API keys, including:
          </p>
          <ul>
            <li>Secure storage in our database with proper encryption</li>
            <li>Row-level security policies that restrict access to only you</li>
            <li>Transmission of API keys only over encrypted connections</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>3. How We Use Your Information</h2>
          <p>We may use the information we collect for various purposes, including to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process and complete transactions</li>
            <li>Send administrative information, such as updates, security alerts, and support messages</li>
            <li>Respond to comments, questions, and requests</li>
            <li>Monitor usage patterns and analyze trends</li>
            <li>Enhance security and troubleshoot issues</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>4. How We Share Your Information</h2>
          <p>
            We do not sell, trade, rent, or otherwise transfer your personal information to 
            third parties without your consent, except as described in this Privacy Policy.
          </p>
          
          <h3>4.1 Service Providers</h3>
          <p>
            We may share your information with third-party service providers who perform 
            services on our behalf, such as hosting, data analysis, payment processing, 
            customer service, and marketing assistance.
          </p>
          
          <h3>4.2 API Processing</h3>
          <p>
            When you use our mind map generation service with your own API keys, those keys 
            are used to make requests to the respective AI service providers (OpenAI, Anthropic, 
            Google, Cohere, etc.). Your text inputs for mind map generation are processed 
            through these services using your API keys.
          </p>
          
          <h3>4.3 Legal Requirements</h3>
          <p>
            We may disclose your information if required to do so by law or in response to 
            valid requests by public authorities (e.g., a court or government agency).
          </p>
        </section>

        <section className="terms-section">
          <h2>5. Data Security</h2>
          <p>
            We have implemented appropriate technical and organizational security measures 
            designed to protect the security of any personal information we process. However, 
            despite our safeguards and efforts to secure your information, no electronic 
            transmission over the Internet or information storage technology can be guaranteed 
            to be 100% secure.
          </p>
        </section>

        <section className="terms-section">
          <h2>6. Your Data Protection Rights</h2>
          <p>Depending on your location, you may have the following rights:</p>
          <ul>
            <li><strong>Access</strong>: You can request copies of your personal information.</li>
            <li><strong>Rectification</strong>: You can request that we correct inaccurate information.</li>
            <li><strong>Erasure</strong>: You can request that we delete your personal information.</li>
            <li><strong>Restriction</strong>: You can request that we restrict the processing of your information.</li>
            <li><strong>Data Portability</strong>: You can request to receive your personal data in a structured, 
                commonly used, and machine-readable format.</li>
            <li><strong>Objection</strong>: You can object to our processing of your personal information.</li>
          </ul>
          <p>
            To exercise any of these rights, please contact us using the contact information provided below.
          </p>
        </section>

        <section className="terms-section">
          <h2>7. Children's Privacy</h2>
          <p>
            Our services are not directed to individuals under the age of 16. We do not knowingly 
            collect personal information from children under 16. If we learn that we have collected 
            personal information from a child under 16, we will take steps to delete that information 
            as quickly as possible.
          </p>
        </section>

        <section className="terms-section">
          <h2>8. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by 
            posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
          <p>
            You are advised to review this Privacy Policy periodically for any changes. Changes to 
            this Privacy Policy are effective when they are posted on this page.
          </p>
        </section>

        <section className="terms-section">
          <h2>9. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
            privacy@mindmapai.example.com
          </p>
        </section>

        <div className="page-navigation">
          <Link to="/" className="back-link">Return to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage; 