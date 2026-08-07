import React from 'react';
import { ExternalLink, Database, Cpu, Globe, Server, Shield, Layers, MessageSquare, CreditCard } from 'lucide-react';
import './styles/Projects.css';

const Projects = ({ config }: { config: any }) => {
  return (
    <section id="projects" className="projects-section container">
      <div className="section-title-wrapper">
        <span className="sec-label">featured work</span>
        <h3 className="sec-title">E-Commerce & Cloud Projects</h3>
        <p className="sec-desc">Showcasing production-level business sync engines and custom storefront deployments.</p>
      </div>

      <div className="projects-flow-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
        {(config?.projects || []).map((proj: any, index: number) => (
          <div className="project-highlight-card glass-panel" key={proj.id || index}>
            <div className="project-main-info" style={{ flex: 1 }}>
              <div className="project-badge">ACTIVE PROJECT</div>
              <h4 className="project-title-name">{proj.title}</h4>
              
              <div className="project-description-block">
                <p className="simple-english-desc" style={{ whiteSpace: 'pre-wrap' }}>
                  {proj.description}
                </p>
              </div>

              {proj.id === 'shopnexa' && (
                <div className="project-workflow-visualizer">
                  <h5 className="workflow-title">Manufacturer-to-Customer Direct Workflow</h5>
                  <div className="workflow-flex-steps">
                    <div className="wf-step">
                      <div className="wf-circle"><i className="fa-solid fa-industry"></i></div>
                      <span>1. Manufacture</span>
                      <p>Creator produces inventory</p>
                    </div>
                    <div className="wf-arrow-next"><i className="fa-solid fa-chevron-right"></i></div>
                    <div className="wf-step">
                      <div className="wf-circle"><i className="fa-solid fa-cart-shopping"></i></div>
                      <span>2. Order Sync</span>
                      <p>Buyer places purchase</p>
                    </div>
                    <div className="wf-arrow-next"><i className="fa-solid fa-chevron-right"></i></div>
                    <div className="wf-step">
                      <div className="wf-circle"><i className="fa-solid fa-truck-ramp-box"></i></div>
                      <span>3. Delivery</span>
                      <p>Direct to customer site</p>
                    </div>
                  </div>
                </div>
              )}

              {proj.url && proj.url !== 'https://' && (
                <div className="project-links">
                  <a 
                    href={proj.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-project-link"
                  >
                    Visit Link <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>

            <div className="project-components-grid">
              <h5 className="components-title">System Integration Components</h5>
              <div className="components-tags-flex" style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginTop: '16px'
              }}>
                {proj.tech.map((tag: string, tagIdx: number) => (
                  <span key={tagIdx} style={{
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-mono)',
                    background: 'rgba(6, 182, 212, 0.05)',
                    border: '1px solid rgba(6, 182, 212, 0.15)',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    color: '#22d3ee'
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Projects;
