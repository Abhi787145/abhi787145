import React from 'react';
import { Briefcase, Calendar, MapPin, Database, Cloud, Server, AlertTriangle } from 'lucide-react';
import './styles/Experience.css';

const Experience = ({ config }: { config: any }) => {
  return (
    <section id="experience" className="experience-section container">
      <div className="section-title-wrapper">
        <span className="sec-label">career history</span>
        <h3 className="sec-title">Work Experience</h3>
        <p className="sec-desc">A timeline of my professional roles and operational engineering duties in enterprise production environments.</p>
      </div>

      <div className="experience-timeline-container" style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
        {(config?.experience || []).map((job: any, index: number) => (
          <div className="experience-card glass-panel" key={index}>
            <div className="exp-card-header">
              <div className="exp-role-title">
                <Briefcase className="exp-briefcase-icon" size={20} />
                <div>
                  <h4>{job.role}</h4>
                  <h5>{job.company}</h5>
                </div>
              </div>
              <div className="exp-meta-info">
                <span className="meta-item"><Calendar size={14} /> {job.duration}</span>
              </div>
            </div>

            <div className="exp-bullet-grid" style={{ marginTop: '20px' }}>
              <h5 className="bullet-title">Key Duties & Accomplishments</h5>
              <div className="bullet-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                {job.tasks.map((task: string, taskIdx: number) => (
                  <div className="bullet-row" key={taskIdx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div className="bullet-icon-box" style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      background: 'rgba(6, 182, 212, 0.05)',
                      border: '1px solid rgba(6, 182, 212, 0.15)',
                      color: '#22d3ee',
                      flexShrink: 0
                    }}>
                      <Server size={12} />
                    </div>
                    <p className="bullet-text" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                      {task}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Experience;
