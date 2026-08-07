import React, { useState, useEffect, useRef } from 'react';
import './styles/Skills.css';

type LogLine = {
  text: string;
  type: 'input' | 'output' | 'error' | 'system';
};

const commands: Record<string, () => string> = {
  help: () => `Available commands:
  whoami          - Brief overview profile of Abhishek Sharma
  skills          - Detail of DevOps, Cloud & Development skills
  projects        - Overview of provisioned AWS Drop Shipping project
  experience      - Review work history at Simplify Healthcare
  certifications  - List active course certifications (AZ-900, AWS, etc.)
  pipeline        - Run the simulated CI/CD build & deploy pipeline
  cat info.txt    - Display contact routes & endpoint details
  clear           - Wipe terminal logs`,

  whoami: () => `NAME:            Abhishek Sharma
ROLE:            DevOps Engineer
PROFILE SUMMARY: DevOps Engineer with hands-on experience in cloud infrastructure,
                 application deployment, configuration management (Ansible), and
                 system monitoring. Skilled in CI/CD pipelines, containerization (Docker,
                 Kubernetes), and release management. Strong SQL Server database and
                 production support experience.`,

  skills: () => `CATEGORY             SKILLSET
AWS                  EC2, VPC, Availability Zone, S3, IAM, Security Groups, Lambda, Load Balancer
Azure                VM, Blob Storage, App Service, Key Vault, SQL Servers, Elastic Pool, Storage Accounts
DevOps / CI/CD       Terraform (IaC), Ansible, Kubernetes, Docker, Git/GitHub, Jenkins, Azure DevOps
Databases            SQL Server Admin, SSMS, Redgate, PGAdmin, MongoDB Compass, IIS Web Server
Languages & Dev      Python, C/C++, .Net, Django
AI & ITSM            Prompting, SIEM monitoring, GLPI Ticketing, ITIL, System Troubleshooting`,

  projects: () => `MODULE: Project - Drop Shipping (AWS infrastructure)
STATUS: Deployed successfully (Active)
DESCRIPTION: Provisioned 40+ AWS services using modular Terraform from scratch.
ARCHITECTURAL METRICS:
  - 1 Virtual Private Cloud (VPC) with public/private subnetting.
  - Multi-AZ Web Application Load Balancer (ALB) + EC2 Auto Scaling Groups.
  - Secure SQL Relational Database (RDS Multi-AZ).
  - CloudWatch metric monitoring & alarms integration.
  - Cost optimized through custom pricing configurations.`,

  experience: () => `[01/2023 - Present] Simplify Healthcare - Associate Application Deployment Engineer
PROJECT: Multi Project Environment
TASKS DELIVERED:
  * Managed container workloads on Docker & Kubernetes cluster nodes.
  * Deployed apps onto Azure App Services; administered storage configurations.
  * Administered SQL database jobs, Bacpac migrations, and backups.
  * Configured SIEM and Azure Alerts mapping memory, CPU, and Disk metrics.
  * Handled daily production deployments; troubleshoot pipeline blockers.`,

  certifications: () => `ACTIVE BADGES:
  - Generative AI Foundation (June 2025) - Microsoft & upGrad
  - Microsoft Azure Fundamentals AZ-900 (October 2025)
  - AWS Certification (March 2026) - Cloud & DevOps HUB
  - Cyber Security Tools & Attacks (August 2020) - Coursera
  - MNA + CloudV2 (June 2019) - Jetking`,

  "cat info.txt": () => `ENDPOINT CONTACT ROUTES:
  - Email:      as787145@gmail.com
  - Phone:      +91 8308989160
  - LinkedIn:   https://www.linkedin.com/in/as787145
  - Github:     https://github.com/abhisheksharma (simulated)
  - Cluster:    visitor-prod-1`,

  pipeline: () => {
    setTimeout(() => {
      const el = document.getElementById('pipelines');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      window.dispatchEvent(new Event('trigger-pipeline-sim'));
    }, 500);
    return `[SYSTEM] Redirecting viewport context to CI/CD pipeline controller...`;
  }
};

const Skills = () => {
  const [history, setHistory] = useState<LogLine[]>([
    { text: 'System session initialized. Welcome guest user.', type: 'system' },
    { text: 'Type "help" to view the available commands in this terminal.', type: 'output' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const terminalBodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommandRun = (cmdText: string) => {
    const trimmed = cmdText.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();

    // 1. Add input command line to history
    setHistory(prev => [...prev, { text: `guest@devops-node:~$ ${trimmed}`, type: 'input' }]);

    // 2. Process command outputs
    if (lower === 'clear') {
      setHistory([]);
    } else if (commands[lower]) {
      const output = commands[lower]();
      setHistory(prev => [...prev, { text: output, type: 'output' }]);
    } else if (lower === 'kubectl get nodes') {
      const output = `NAME             STATUS   ROLES    AGE   VERSION
k8s-master-01    Ready    control  320d  v1.28.2
k8s-worker-01    Ready    worker   320d  v1.28.2
k8s-worker-02    Ready    worker   320d  v1.28.2`;
      setHistory(prev => [...prev, { text: output, type: 'output' }]);
    } else if (lower === 'terraform init') {
      const output = `Initializing the backend...
Initializing provider plugins...
- Finding hashicorp/aws versions >= 4.0.0...
- Finding hashicorp/azurerm versions >= 3.0.0...
Terraform has been successfully initialized!`;
      setHistory(prev => [...prev, { text: output, type: 'output' }]);
    } else {
      const errorMsg = `bash: command not found: ${trimmed}. Type 'help' for options.`;
      setHistory(prev => [...prev, { text: errorMsg, type: 'error' }]);
    }

    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommandRun(inputValue);
    }
  };

  return (
    <section id="infrastructure" className="cluster-section container">
      <div className="section-title-wrapper">
        <span className="sec-label">interactive shell</span>
        <h3 className="sec-title">CloudOps Shell Console</h3>
        <p className="sec-desc">Interact with the Command Console simulator to query my profile metadata, core skills database, or run deployment pipelines.</p>
      </div>

      {/* Terminal Command Console Simulator */}
      <div className="terminal-console-wrapper glass-panel">
        <div className="terminal-header">
          <div className="terminal-dots">
            <span className="dot dot-red"></span>
            <span className="dot dot-yellow"></span>
            <span className="dot dot-green"></span>
          </div>
          <div className="terminal-title">guest@devops-node: ~</div>
          <div className="terminal-status">session: active</div>
        </div>

        <div className="terminal-body" ref={terminalBodyRef}>
          {history.map((line, idx) => (
            <div
              key={idx}
              className={`terminal-line ${line.type}`}
              dangerouslySetInnerHTML={{ __html: line.text.replace(/\n/g, '<br>') }}
            />
          ))}
          <div className="terminal-input-row">
            <span className="terminal-prompt">guest@devops-node:~$</span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="terminal-input"
              placeholder="Type a command (e.g. 'help')..."
            />
          </div>
        </div>

        <div className="terminal-presets">
          <span className="presets-label">Quick Shell Shortcuts:</span>
          <div className="presets-grid">
            {['help', 'whoami', 'skills', 'projects', 'experience', 'certifications', 'clear'].map((cmd) => (
              <button key={cmd} onClick={() => handleCommandRun(cmd)} className="preset-btn">
                <i className="fa-solid fa-terminal"></i> {cmd}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="platform-grid-card glass-panel">
        <div className="platform-grid-header">
          <h4><i className="fa-solid fa-server"></i> Main Core Competency Platforms</h4>
        </div>
        <div className="platforms-flex">
          {/* AWS Platform */}
          <div className="platform-item">
            <div className="platform-logo-wrapper">
              <svg className="svg-logo" viewBox="0 0 100 100" fill="currentColor">
                <path fill="#FF9900" d="M47.7,13.6c-4.9-0.2-9.7,2.1-12.7,6.1c-1.3,1.7-2,3.8-2.1,6c-0.1,5.2,4,9.6,9.2,9.7c5.1,0.1,9.4-3.7,9.7-8.8c0.2-3.1-0.9-6.1-3.2-8.3C49.9,13.9,48.8,13.7,47.7,13.6z"/>
                <path fill="#232F3E" d="M84.2,56.8c0-10.4-8.8-14.7-22.3-15.8c-10.5-0.9-19.1,1.1-23.7,3.6c-1.3,0.7-2,2.2-1.7,3.6l1.9,8.4c0.3,1.2,1.3,2.1,2.5,2.1c2.8-1.5,8-3,13.6-2.5c8.3,0.7,11.3,3.3,11.3,7.4v1.8c-6,0.3-15,0.9-22.3,3.8c-7.9,3.1-13,9.5-13,17.4c0,9,7.1,14.6,17.3,14.6c8.5,0,15.2-4.1,18.7-9.5c0.8,3,3,5.4,5.9,6.5c1.4,0.5,2.9,0.5,4.3,0.1c1.2-0.4,2.2-1.2,2.7-2.3c1.7-3.7,2.1-11,2.1-17.7V56.8z M65,75c0,6.5-4,10.6-10.3,10.6c-5.1,0-8.2-2.9-8.2-7.5c0-5.8,4.6-8.3,11.8-9c4-0.4,5.8-0.6,6.7-0.7V75z"/>
                <path fill="#FF9900" d="M12,83c16.2,10.7,37,16.2,56.3,14.8c12.2-0.9,23.8-4.7,33.7-11.2c1.7-1.1,1.9-3.4,0.6-4.9c-0.8-0.9-2.1-1.3-3.2-0.9c-9.5,4.9-20.3,7.6-31.2,7.9c-17.1,0.5-35.4-3.8-49.8-13.4c-1.7-1.1-4-0.6-5.1,1.1C12,81,11.7,82.1,12,83L12,83z M97.7,80c-0.9-1.2-2.6-1.5-3.8-0.7c-0.7,0.5-1.1,1.2-1.3,2l-0.8,4c-0.3,1.3,0.6,2.5,1.9,2.8c0.2,0,0.4,0,0.6,0l4.5-0.9c1.3-0.3,2.2-1.4,2.1-2.7c-0.1-0.9-0.6-1.7-1.4-2.1L97.7,80z"/>
              </svg>
            </div>
            <h5>Amazon Web Services (AWS)</h5>
            <p>VPC Networking Subnets, EC2 Instance Nodes, RDS Multi-AZ Databases administration, S3 Bucket assets, Lambda API endpoints, Route53, and CloudWatch metrics operations.</p>
          </div>

          {/* Azure Platform */}
          <div className="platform-item">
            <div className="platform-logo-wrapper">
              <svg className="svg-logo" viewBox="0 0 100 100" fill="currentColor">
                <path fill="#0089D6" d="M13,67L35,22L53,42L22,81L13,67Z"/>
                <path fill="#00BCF2" d="M53,42L77,13L87,26L48,87L31,69L53,42Z"/>
              </svg>
            </div>
            <h5>Microsoft Azure</h5>
            <p>Virtual Machines deployment, Storage Accounts, App Services plans hosting, Key Vault secure credentials management, SQL Server instances, and Elastic Pools.</p>
          </div>

          {/* Kubernetes */}
          <div className="platform-item">
            <div className="platform-logo-wrapper">
              <svg className="svg-logo" viewBox="0 0 100 100" fill="currentColor">
                <path fill="#326CE5" d="M50,9.2L85.3,22V63.6L50,91.8L14.7,63.6V22L50,9.2Z M50,17.4L21.8,27.7V59.4L50,81.9L78.2,59.4V27.7L50,17.4Z"/>
                <path fill="#326CE5" d="M50,30.3L64.1,44.4L50,58.5L35.9,44.4L50,30.3Z M50,36L41.6,44.4L50,52.8L58.4,44.4L50,36Z"/>
                <line x1="50" y1="9.2" x2="50" y2="30.3" stroke="#326CE5" strokeWidth="4"/>
                <line x1="85.3" y1="22" x2="64.1" y2="44.4" stroke="#326CE5" strokeWidth="4"/>
                <line x1="85.3" y1="63.6" x2="64.1" y2="44.4" stroke="#326CE5" strokeWidth="4"/>
                <line x1="50" y1="91.8" x2="50" y2="58.5" stroke="#326CE5" strokeWidth="4"/>
                <line x1="14.7" y1="63.6" x2="35.9" y2="44.4" stroke="#326CE5" strokeWidth="4"/>
                <line x1="14.7" y1="22" x2="35.9" y2="44.4" stroke="#326CE5" strokeWidth="4"/>
              </svg>
            </div>
            <h5>Kubernetes</h5>
            <p>Orchestrating container pods, scaling workloads replicas, configuring persistent storage volumes, and defining custom yaml node specifications.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
