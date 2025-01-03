import React from 'react';
import PropTypes from 'prop-types';
import './WelcomeScreen.css';

const WelcomeScreen = ({ onLogin }) => {
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-header">
          <i className="fas fa-weight fa-3x mb-4 text-primary"></i>
          <h1 className="display-4 mb-3">Welcome to Weight Tracker</h1>
          <p className="lead mb-4">
            A secure and efficient way to track and manage weights on the Internet Computer
          </p>
        </div>

        <div className="steps-section mb-5">
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Login</h4>
                <p>Securely sign in with Internet Identity</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Create Batch</h4>
                <p>Organize your weights into batches</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Add Weights</h4>
                <p>Start tracking your measurements</p>
              </div>
            </div>
          </div>
        </div>

        <div className="demo-section mb-5">
          <div className="demo-video">
            <div className="ratio ratio-16x9">
              <div className="demo-placeholder">
                <i className="fas fa-play-circle fa-3x mb-3"></i>
                <h4>See how it works</h4>
                <p className="text-muted">Quick 2-minute demo</p>
              </div>
            </div>
          </div>
        </div>

        <div className="features-grid mb-5">
          <div className="feature-card" data-testid="feature-card">
            <i className="fas fa-box feature-icon"></i>
            <h3>Versatile</h3>
            <p>Track weights for any items or purposes</p>
          </div>
          <div className="feature-card" data-testid="feature-card">
            <i className="fas fa-share-alt feature-icon"></i>
            <h3>Collaborative</h3>
            <p>Share data with team members securely</p>
          </div>
          <div className="feature-card" data-testid="feature-card">
            <i className="fas fa-chart-line feature-icon"></i>
            <h3>Insightful</h3>
            <p>Track trends and analyze progress</p>
          </div>
          <div className="feature-card" data-testid="feature-card">
            <i className="fas fa-clock feature-icon"></i>
            <h3>Real-time</h3>
            <p>Instant updates and synchronization</p>
          </div>
        </div>

        <div className="login-section">
          <button className="btn btn-primary btn-lg login-button" onClick={onLogin}>
            <i className="fas fa-sign-in-alt me-2"></i>
            Login with Internet Identity
          </button>
          <p className="mt-3 text-muted">
            Secure authentication powered by Internet Identity
          </p>
        </div>
      </div>
    </div>
  );
};

WelcomeScreen.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default WelcomeScreen; 