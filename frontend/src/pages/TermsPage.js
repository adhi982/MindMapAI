import React from 'react';
import { Link } from 'react-router-dom';
import './Pages.css';

const TermsPage = () => {
  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last Updated: May 10, 2025</p>

        <section className="terms-section">
          <h2>1. Introduction</h2>
          <p>
            Welcome to MindMapAI ("we," "our," or "us"). By accessing or using our website, services, 
            applications, or tools (collectively, the "Services"), you agree to these Terms of Service. 
            Please read these terms carefully.
          </p>
        </section>

        <section className="terms-section">
          <h2>2. Using Our Services</h2>
          <p>
            You must follow any policies made available to you within the Services. You may use our 
            Services only as permitted by law. We may suspend or stop providing our Services to you 
            if you do not comply with our terms or policies or if we are investigating suspected misconduct.
          </p>
          
          <h3>2.1 User Accounts</h3>
          <p>
            Some of our Services require you to create an account. You are responsible for safeguarding 
            your account, and for any activities or actions under your account. We recommend using 
            strong passwords and keeping your login information secure.
          </p>
          
          <h3>2.2 API Keys</h3>
          <p>
            Our service allows you to input and store your own API keys for various AI providers. 
            You are solely responsible for:
          </p>
          <ul>
            <li>Ensuring you have proper authorization to use these API keys</li>
            <li>Any charges incurred through the use of these API keys</li>
            <li>Maintaining the security and confidentiality of your API keys</li>
          </ul>
          <p>
            While we implement security measures to protect your stored API keys, we cannot guarantee 
            absolute security and are not responsible for any unauthorized access to or use of your API keys.
          </p>
        </section>

        <section className="terms-section">
          <h2>3. Privacy and Copyright Protection</h2>
          <p>
            Our <Link to="/privacy">Privacy Policy</Link> explains how we treat your personal data and 
            protect your privacy when you use our Services. By using our Services, you agree that we 
            can use such data in accordance with our privacy policy.
          </p>
        </section>

        <section className="terms-section">
          <h2>4. Your Content in Our Services</h2>
          <p>
            Our Services allow you to upload, submit, store, send, or receive content. You retain ownership 
            of any intellectual property rights that you hold in that content. When you upload, submit, 
            store, send, or receive content to or through our Services, you give us a worldwide license 
            to use, host, store, reproduce, modify, create derivative works, communicate, publish, 
            publicly perform, publicly display and distribute such content for the limited purpose of 
            operating, promoting, and improving our Services.
          </p>
          <p>
            You represent and warrant that you have all the rights, power, and authority necessary to 
            grant the rights granted herein to any content that you submit.
          </p>
        </section>

        <section className="terms-section">
          <h2>5. Software in Our Services</h2>
          <p>
            When a Service requires or includes downloadable software, this software may update 
            automatically on your device once a new version or feature is available.
          </p>
          <p>
            We give you a personal, worldwide, royalty-free, non-assignable, and non-exclusive license 
            to use the software provided to you as part of the Services. This license is for the sole 
            purpose of enabling you to use and enjoy the benefit of the Services as provided by us, 
            in the manner permitted by these terms.
          </p>
        </section>

        <section className="terms-section">
          <h2>6. Modifying and Terminating Our Services</h2>
          <p>
            We are constantly changing and improving our Services. We may add or remove functionalities 
            or features, and we may suspend or stop a Service altogether.
          </p>
          <p>
            You can stop using our Services at any time. We may also stop providing Services to you, 
            or add or create new limits to our Services at any time.
          </p>
        </section>

        <section className="terms-section">
          <h2>7. Liability for Our Services</h2>
          <p>
            To the maximum extent permitted by law, the Services are provided "as is" without warranties 
            of any kind, either express or implied. We do not warrant that the Services will be uninterrupted 
            or error-free, or that defects will be corrected.
          </p>
          <p>
            To the maximum extent permitted by law, we will not be liable for any indirect, incidental, 
            special, consequential, or punitive damages resulting from your use of or inability to use 
            the Services.
          </p>
        </section>

        <section className="terms-section">
          <h2>8. About These Terms</h2>
          <p>
            We may modify these terms or any additional terms that apply to a Service to, for example, 
            reflect changes to the law or changes to our Services. You should look at the terms regularly. 
            We'll post notice of modifications to these terms on this page. Changes will not apply 
            retroactively and will become effective no sooner than fourteen days after they are posted. 
            However, changes addressing new functions for a Service or changes made for legal reasons 
            will be effective immediately.
          </p>
        </section>

        <div className="page-navigation">
          <Link to="/" className="back-link">Return to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default TermsPage; 