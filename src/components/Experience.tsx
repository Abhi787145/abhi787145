import React from 'react';
import { Briefcase, Calendar, MapPin, Database, Cloud, Server, AlertTriangle } from 'lucide-react';
import './styles/Experience.css';

const Experience = () => {
  const simplifyDetails = [
    { text: 'Monitored alerts for Disk Space, Memory and CPU utilization.', icon: AlertTriangle },
    { text: 'Administered SQL Server databases, including backups, Bacpac creation, and script execution via SSMS, PGAdmin and MongoDB Compass.', icon: Database },
    { text: 'Maintained and deployed applications on Azure App Services and managed Storage Accounts.', icon: Cloud },
    { text: 'Executed daily deployments and monitored automated jobs for reliability and performance.', icon: Server },
    { text: 'Applied strong troubleshooting and problem-solving skills across CI/CD pipelines and cloud environments.', icon: Briefcase }
  ];

  const extraResponsibilities = [
    'Oversaw SDLC processes to ensure smooth development, deployment, and operational stability.',
    'Automated server configurations using Ansible and deployed container applications using Docker and Kubernetes.',
    'Monitored cloud infrastructure using SIEM tools and Azure Alerts for proactive incident resolution.'
  ];

  return (
    <section id="experience" className="experience-section container">
      <div className="section-title-wrapper">
        <span className="sec-label">career history</span>
        <h3 className="sec-title">Work Experience</h3>
        <p className="sec-desc">A timeline of my professional roles and operational engineering duties in enterprise production environments.</p>
      </div>

      <div className="experience-timeline-container">
        <div className="experience-card glass-panel">
          <div className="exp-card-header">
            <div className="exp-role-title">
              <Briefcase className="exp-briefcase-icon" size={20} />
              <div>
                <h4>Associate Application Deployment Engineer</h4>
                <h5>Simplify Healthcare</h5>
              </div>
            </div>
            <div className="exp-meta-info">
              <span className="meta-item"><Calendar size={14} /> Jan 2023 - Present</span>
              <span className="meta-item"><MapPin size={14} /> Pune, MH</span>
            </div>
          </div>

          <div className="exp-summary-text">
            <p>
              Operating inside a Multi-Project Environment, serving as a core systems and release operations administrator. Tasked with deploying enterprise healthcare software packages, configuring cloud databases, and maintaining uptime limits across critical staging and production channels.
            </p>
          </div>

          <div className="exp-bullet-grid">
            <h5 className="bullet-title">Key Duties & Accomplishments</h5>
            <div className="bullet-items-list">
              {simplifyDetails.map((bullet, index) => {
                const BulletIcon = bullet.icon;
                return (
                  <div className="bullet-row" key={index}>
                    <div className="bullet-icon-box">
                      <BulletIcon size={14} />
                    </div>
                    <p className="bullet-text">{bullet.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="exp-extra-footer">
            <h5 className="bullet-title">Operational Scope</h5>
            <ul className="footer-bullets-list">
              {extraResponsibilities.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
