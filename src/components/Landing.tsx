import React, { useEffect, useRef, useState } from 'react';
import OperatorModel from './OperatorModel';
import TechBalls from './TechBalls';
import './styles/Landing.css';

const Landing = ({ config }: { config: any }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTitleIdx, setActiveTitleIdx] = useState(0);
  const titles = [
    'Infrastructure Automator',
    'CI/CD Pipeline Architect',
    'Database Administrator',
    'Cloud Systems Engineer'
  ];

  // Title rotator effect
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTitleIdx((prev) => (prev + 1) % titles.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Canvas floating nodes topology animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = canvas.width = rect.width;
      height = canvas.height = rect.height;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize interactive nodes
    const nodeCount = 28;
    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      glow: boolean;
    }> = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1.5,
        glow: Math.random() > 0.7
      });
    }

    // Mouse interactivity
    let mouse = { x: -1000, y: -1000 };
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw grid intersections
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update and draw nodes
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce boundaries
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Draw connections
        nodes.forEach((otherNode) => {
          const dx = node.x - otherNode.x;
          const dy = node.y - otherNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.12;
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(otherNode.x, otherNode.y);
            ctx.stroke();
          }
        });

        // Interactive mouse connection
        const mdx = node.x - mouse.x;
        const mdy = node.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 140) {
          const alpha = (1 - mdist / 140) * 0.35;
          ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        if (node.glow) {
          ctx.fillStyle = '#06b6d4';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#06b6d4';
        } else {
          ctx.fillStyle = '#8b5cf6';
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <section id="overview" className="landing-section">
      {/* Decorative blurred background blobs */}
      <div className="landing-glow landing-glow-1"></div>
      <div className="landing-glow landing-glow-2"></div>
      
      <div className="landing-grid-container container">
        <div className="landing-left">
          <div className="landing-badges">
            <span className="landing-badge active-status">
              <span className="ping-dot"></span> System State: Operational
            </span>
            <span className="landing-badge region-badge">
              <i className="fa-solid fa-earth-americas"></i> ap-south-1 (Pune)
            </span>
          </div>

          <h1 className="landing-name">{config?.profile?.name || 'Abhishek Sharma'}</h1>
          
          <div className="title-rotator-wrapper">
            <span className="static-prefix">Expert</span>{' '}
            <span className="rotating-text">{titles[activeTitleIdx]}</span>
          </div>

          <p className="landing-summary">
            {config?.profile?.summary}
          </p>

          <div className="landing-actions">
            <a href="#pipelines" className="btn-glow-primary">
              <i className="fa-solid fa-circle-play"></i> Trigger Pipeline
            </a>
            <a href="#projects" className="btn-glow-secondary">
              <i className="fa-solid fa-cube"></i> Explore Projects
            </a>
          </div>

          <div className="landing-social-links">
            {config?.profile?.linkedin && (
              <a href={config.profile.linkedin} target="_blank" rel="noopener noreferrer" className="landing-social-icon" title="LinkedIn">
                <i className="fa-brands fa-linkedin"></i>
              </a>
            )}
            {config?.profile?.email && (
              <a href={`mailto:${config.profile.email}`} className="landing-social-icon" title="Send Email">
                <i className="fa-solid fa-envelope"></i>
              </a>
            )}
            {config?.profile?.github && (
              <a href={config.profile.github} target="_blank" rel="noopener noreferrer" className="landing-social-icon" title="GitHub">
                <i className="fa-brands fa-github"></i>
              </a>
            )}
          </div>
        </div>

        <div className="landing-right-column">
          <div className="landing-right glass-panel">
            <div className="right-card-header">
              <span className="card-lbl">CORE TOOLING REPLICAS (3D)</span>
              <span className="card-ping">Status: Active</span>
            </div>
            <div className="canvas-wrapper">
              <TechBalls skills={config?.skills || []} />
            </div>
          </div>

          <div className="landing-operator-card glass-panel">
            <div className="right-card-header">
              <span className="card-lbl">OPERATOR BIO-LINK (3D)</span>
              <span className="card-ping">Status: Active</span>
            </div>
            <div className="operator-canvas-wrapper">
              <OperatorModel />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Landing;
