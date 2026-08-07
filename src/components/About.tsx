import React from 'react';
import './styles/About.css';

const About = ({ config }: { config: any }) => {
  return (
    <section id="about" className="about-section container">
      <div className="section-title-wrapper">
        <span className="sec-label">profile summary</span>
        <h3 className="sec-title">Operational Core & Background</h3>
        <p className="sec-desc">A deep dive into my operational philosophies and system reliability objectives.</p>
      </div>

      <div className="about-grid">
        <div className="about-left-summary glass-panel">
          <h4 className="summary-title">Profile Summary</h4>
          <p style={{ whiteSpace: 'pre-wrap' }}>
            {config?.profile?.summary}
          </p>
        </div>

        <div className="about-philosophies">
          <div className="philosophy-card glass-panel">
            <div className="philosophy-icon">
              <i className="fa-solid fa-arrows-spin"></i>
            </div>
            <div className="philosophy-content">
              <h5>Continuous Automation</h5>
              <p>Eliminating operational drag by automating server creation, config audits, and dependency builds via modular IaC blueprints.</p>
            </div>
          </div>

          <div className="philosophy-card glass-panel">
            <div className="philosophy-icon">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <div className="philosophy-content">
              <h5>Reliability Engineering</h5>
              <p>Ensuring system integrity through proactive diagnostic probes, distributed telemetry graphs, and incident alerting limits.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
