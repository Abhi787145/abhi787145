import React, { useState } from 'react';
import { 
  ArrowLeft, Save, Download, RotateCcw, Plus, Trash2, ArrowUp, ArrowDown,
  User, Cpu, Briefcase, FolderGit2, ShieldCheck, Check, AlertCircle 
} from 'lucide-react';
import './styles/Admin.css';

type AdminProps = {
  config: any;
  setConfig: (config: any) => void;
};

const ALL_AVAILABLE_SECTIONS = [
  { id: 'landing', label: 'Landing Hero Panel' },
  { id: 'about', label: 'About Summary Panel' },
  { id: 'skills', label: 'CloudOps Terminal Console' },
  { id: 'pipelines', label: 'CI/CD Pipelines Panel' },
  { id: 'projects', label: 'Projects Showcase Panel' },
  { id: 'experience', label: 'Work Experience Timeline' },
  { id: 'credentials', label: 'Certifications Panel' },
  { id: 'contact', label: 'YAML Contact Form' }
];

const PREDEFINED_COLORS = [
  { name: 'Slate/Charcoal', hex: '#10172A' },
  { name: 'Dark Blue', hex: '#0A1224' },
  { name: 'Deep Cyan', hex: '#051E39' },
  { name: 'Cyber Blue', hex: '#0A1B39' },
  { name: 'Purple', hex: '#0D091F' },
  { name: 'Rust Red', hex: '#1C0D0D' },
  { name: 'Emerald Green', hex: '#052416' },
  { name: 'Deep Black', hex: '#000000' },
  { name: 'Graphite', hex: '#1C1917' }
];

const Admin = ({ config, setConfig }: AdminProps) => {
  const [isAuthorized, setIsAuthorized] = useState(() => {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const sha256 = async (message: string) => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsAuthenticating(true);

    try {
      const hashed = await sha256(passcode);
      if (hashed === '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9') {
        sessionStorage.setItem('admin_authenticated', 'true');
        setIsAuthorized(true);
      } else {
        setLoginError('Access Denied: Invalid Decryption Key');
      }
    } catch (err) {
      setLoginError('Authentication engine error. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'profile' | 'skills' | 'projects' | 'experience'>('profile');
  const [localConfig, setLocalConfig] = useState(JSON.parse(JSON.stringify(config)));
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });

  const showStatus = (text: string, type: 'success' | 'error') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage({ text: '', type: '' }), 4000);
  };

  if (!isAuthorized) {
    return (
      <div className="admin-login-container">
        <div className="grid-bg"></div>
        <div className="login-card glass-panel">
          <div className="login-header">
            <ShieldCheck size={36} className="login-icon" />
            <h3>CloudOps Encryption Gate</h3>
            <span className="console-prefix">visitor-dev-environment // authentication required</span>
          </div>

          <form onSubmit={handleLoginSubmit} className="login-form">
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Enter Admin Passcode</label>
              <input 
                type="password" 
                placeholder="••••••••••••"
                value={passcode} 
                onChange={(e) => setPasscode(e.target.value)} 
                disabled={isAuthenticating}
                autoFocus
              />
            </div>
            
            {loginError && (
              <div className="login-error-message">
                <AlertCircle size={14} />
                <span>{loginError}</span>
              </div>
            )}

            <button type="submit" className="btn-action btn-apply btn-login-submit" disabled={isAuthenticating} style={{ width: '100%', justifyContent: 'center' }}>
              {isAuthenticating ? 'Decrypting...' : 'Decrypt Access'}
            </button>
          </form>

          <a href="#/" className="btn-back btn-login-back" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', width: '100%' }}>
            <ArrowLeft size={16} /> Return to Portfolio
          </a>
        </div>
      </div>
    );
  }

  // Section Order handlers
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const list = [...localConfig.sections];
    if (direction === 'up' && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === 'down' && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    }
    setLocalConfig({ ...localConfig, sections: list });
  };

  const toggleSectionVisibility = (sectionId: string) => {
    let list = [...localConfig.sections];
    if (list.includes(sectionId)) {
      list = list.filter(id => id !== sectionId);
    } else {
      // Find original position or append
      const originalIdx = ALL_AVAILABLE_SECTIONS.findIndex(s => s.id === sectionId);
      list.splice(originalIdx, 0, sectionId);
      // Clean up index insertion to match only existing IDs
      list = list.filter((v, i) => list.indexOf(v) === i);
    }
    setLocalConfig({ ...localConfig, sections: list });
  };

  // Profile fields handler
  const handleProfileChange = (key: string, value: string) => {
    setLocalConfig({
      ...localConfig,
      profile: {
        ...localConfig.profile,
        [key]: value
      }
    });
  };

  // Skills Spheres handlers
  const handleSkillChange = (index: number, key: string, value: string) => {
    const list = [...localConfig.skills];
    list[index][key] = value;
    setLocalConfig({ ...localConfig, skills: list });
  };

  const addSkill = () => {
    setLocalConfig({
      ...localConfig,
      skills: [...localConfig.skills, { name: 'New Skill', bg: '#000000' }]
    });
  };

  const removeSkill = (index: number) => {
    setLocalConfig({
      ...localConfig,
      skills: localConfig.skills.filter((_: any, i: number) => i !== index)
    });
  };

  // Skills CLI Categories handlers
  const handleCategoryChange = (index: number, key: string, value: string) => {
    const list = [...localConfig.skillsCategories];
    list[index][key] = value;
    setLocalConfig({ ...localConfig, skillsCategories: list });
  };

  const addCategory = () => {
    setLocalConfig({
      ...localConfig,
      skillsCategories: [...localConfig.skillsCategories, { category: 'New Category', skills: 'Skill A, Skill B' }]
    });
  };

  const removeCategory = (index: number) => {
    setLocalConfig({
      ...localConfig,
      skillsCategories: localConfig.skillsCategories.filter((_: any, i: number) => i !== index)
    });
  };

  // Projects handlers
  const handleProjectChange = (index: number, key: string, value: any) => {
    const list = [...localConfig.projects];
    if (key === 'tech') {
      list[index][key] = value.split(',').map((t: string) => t.trim());
    } else {
      list[index][key] = value;
    }
    setLocalConfig({ ...localConfig, projects: list });
  };

  const addProject = () => {
    setLocalConfig({
      ...localConfig,
      projects: [...localConfig.projects, {
        id: `project-${Date.now()}`,
        title: 'New Integration Project',
        description: 'Describe your pipeline engineering or cloud deployment work.',
        url: 'https://',
        tech: ['AWS', 'Docker']
      }]
    });
  };

  const removeProject = (index: number) => {
    setLocalConfig({
      ...localConfig,
      projects: localConfig.projects.filter((_: any, i: number) => i !== index)
    });
  };

  // Experience handlers
  const handleExperienceChange = (jobIdx: number, key: string, value: any) => {
    const list = [...localConfig.experience];
    list[jobIdx][key] = value;
    setLocalConfig({ ...localConfig, experience: list });
  };

  const handleTaskChange = (jobIdx: number, taskIdx: number, value: string) => {
    const list = [...localConfig.experience];
    list[jobIdx].tasks[taskIdx] = value;
    setLocalConfig({ ...localConfig, experience: list });
  };

  const addTask = (jobIdx: number) => {
    const list = [...localConfig.experience];
    list[jobIdx].tasks.push('New responsibility or achievements log line.');
    setLocalConfig({ ...localConfig, experience: list });
  };

  const removeTask = (jobIdx: number, taskIdx: number) => {
    const list = [...localConfig.experience];
    list[jobIdx].tasks = list[jobIdx].tasks.filter((_: any, i: number) => i !== taskIdx);
    setLocalConfig({ ...localConfig, experience: list });
  };

  const addJob = () => {
    setLocalConfig({
      ...localConfig,
      experience: [...localConfig.experience, {
        role: 'DevOps Engineer',
        company: 'Company Name',
        duration: '2025 - Present',
        tasks: ['Performed container workload orchestration and automated system setups.']
      }]
    });
  };

  const removeJob = (index: number) => {
    setLocalConfig({
      ...localConfig,
      experience: localConfig.experience.filter((_: any, i: number) => i !== index)
    });
  };

  // Certifications handlers
  const handleCertChange = (index: number, value: string) => {
    const list = [...localConfig.certifications];
    list[index] = value;
    setLocalConfig({ ...localConfig, certifications: list });
  };

  const addCert = () => {
    setLocalConfig({
      ...localConfig,
      certifications: [...localConfig.certifications, 'New Industry Certification Course']
    });
  };

  const removeCert = (index: number) => {
    setLocalConfig({
      ...localConfig,
      certifications: localConfig.certifications.filter((_: any, i: number) => i !== index)
    });
  };

  // Global actions
  const applyLive = () => {
    try {
      localStorage.setItem('portfolio_config', JSON.stringify(localConfig));
      setConfig(localConfig);
      showStatus('Configuration applied to live preview! Head back to the homepage to see changes.', 'success');
    } catch (e) {
      showStatus('Failed to save to browser storage.', 'error');
    }
  };

  const exportConfig = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localConfig, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "portfolio-config.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showStatus('Configuration file downloaded! Place this file inside the "public/" directory of the project.', 'success');
    } catch (e) {
      showStatus('Failed to export configuration.', 'error');
    }
  };

  const resetConfig = async () => {
    if (window.confirm('Reset all changes and load default config?')) {
      localStorage.removeItem('portfolio_config');
      try {
        const response = await fetch('./portfolio-config.json');
        if (response.ok) {
          const data = await response.json();
          setLocalConfig(data);
          setConfig(data);
          showStatus('Reset completed successfully. Local storage cleared.', 'success');
        }
      } catch (e) {
        showStatus('Restored browser default settings.', 'success');
        window.location.reload();
      }
    }
  };

  return (
    <div className="admin-dashboard-container">
      <header className="admin-header">
        <div className="admin-header-left">
          <a href="#/" className="btn-back">
            <ArrowLeft size={16} /> Portfolio Home
          </a>
          <div className="admin-title-group">
            <h2>CloudOps CMS Console</h2>
            <span className="console-prefix">visitor-dev-environment // write-access active</span>
          </div>
        </div>

        <div className="admin-actions">
          <button className="btn-action btn-apply" onClick={applyLive}>
            <Save size={16} /> Apply Live
          </button>
          <button className="btn-action btn-export" onClick={exportConfig}>
            <Download size={16} /> Export JSON
          </button>
          <button className="btn-action btn-reset" onClick={resetConfig}>
            <RotateCcw size={16} /> Reset defaults
          </button>
        </div>
      </header>

      {statusMessage.text && (
        <div className={`status-banner ${statusMessage.type}`}>
          {statusMessage.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <button 
            className={`sidebar-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} /> Profile & Layout
          </button>
          <button 
            className={`sidebar-tab ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            <Cpu size={18} /> Skills (3D & CLI)
          </button>
          <button 
            className={`sidebar-tab ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <FolderGit2 size={18} /> Projects & Certs
          </button>
          <button 
            className={`sidebar-tab ${activeTab === 'experience' ? 'active' : ''}`}
            onClick={() => setActiveTab('experience')}
          >
            <Briefcase size={18} /> Work Experience
          </button>
        </aside>

        <main className="admin-main">
          {/* TAB 1: PROFILE & LAYOUT */}
          {activeTab === 'profile' && (
            <div className="tab-pane">
              <h3>Profile Settings</h3>
              <div className="form-group-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={localConfig.profile.name} 
                    onChange={(e) => handleProfileChange('name', e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label>Job Title/Role</label>
                  <input 
                    type="text" 
                    value={localConfig.profile.role} 
                    onChange={(e) => handleProfileChange('role', e.target.value)} 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Profile Summary / Bio</label>
                <textarea 
                  rows={4}
                  value={localConfig.profile.summary} 
                  onChange={(e) => handleProfileChange('summary', e.target.value)} 
                />
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>Contact Email</label>
                  <input 
                    type="email" 
                    value={localConfig.profile.email} 
                    onChange={(e) => handleProfileChange('email', e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label>LinkedIn URL</label>
                  <input 
                    type="text" 
                    value={localConfig.profile.linkedin} 
                    onChange={(e) => handleProfileChange('linkedin', e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label>GitHub Profile URL</label>
                  <input 
                    type="text" 
                    value={localConfig.profile.github} 
                    onChange={(e) => handleProfileChange('github', e.target.value)} 
                  />
                </div>
              </div>

              <hr className="divider" />

              <h3>Layout Section Alignment & Order</h3>
              <p className="section-instruction">
                Re-order components using the arrow keys, or check/uncheck to hide sections from rendering on the live page.
              </p>
              <div className="sections-list">
                {ALL_AVAILABLE_SECTIONS.map((section, idx) => {
                  const isVisible = localConfig.sections.includes(section.id);
                  const activeIndex = localConfig.sections.indexOf(section.id);

                  return (
                    <div className={`section-order-row ${isVisible ? 'visible' : 'hidden'}`} key={section.id}>
                      <div className="section-row-left">
                        <input 
                          type="checkbox" 
                          checked={isVisible} 
                          onChange={() => toggleSectionVisibility(section.id)} 
                        />
                        <span className="section-label">{section.label}</span>
                        <span className="section-id-tag">#{section.id}</span>
                      </div>
                      
                      {isVisible && (
                        <div className="section-row-actions">
                          <button 
                            className="btn-order-arrow" 
                            disabled={activeIndex === 0} 
                            onClick={() => moveSection(activeIndex, 'up')}
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button 
                            className="btn-order-arrow" 
                            disabled={activeIndex === localConfig.sections.length - 1} 
                            onClick={() => moveSection(activeIndex, 'down')}
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SKILLS (3D & CLI) */}
          {activeTab === 'skills' && (
            <div className="tab-pane">
              <div className="header-with-action">
                <h3>CORE TOOLING REPLICAS (3D physics spheres)</h3>
                <button className="btn-add-item" onClick={addSkill}>
                  <Plus size={14} /> Add 3D Skill Ball
                </button>
              </div>
              <p className="section-instruction">
                Manage the interactive 3D physics spheres. If a skill does not have a predefined brand logo, it will automatically fallback to high-fidelity 3D text circles.
              </p>

              <div className="skills-grid-editor">
                {localConfig.skills.map((skill: any, idx: number) => (
                  <div className="skill-card-editor" key={idx}>
                    <div className="card-editor-header">
                      <span>Sphere #{idx + 1}</span>
                      <button className="btn-delete-card" onClick={() => removeSkill(idx)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="form-group">
                      <label>Skill / Tool Name</label>
                      <input 
                        type="text" 
                        value={skill.name} 
                        onChange={(e) => handleSkillChange(idx, 'name', e.target.value)} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Sphere Texture BG</label>
                      <select 
                        value={skill.bg} 
                        onChange={(e) => handleSkillChange(idx, 'bg', e.target.value)}
                      >
                        {PREDEFINED_COLORS.map(c => (
                          <option value={c.hex} key={c.hex}>{c.name} ({c.hex})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="divider" />

              <div className="header-with-action">
                <h3>Shell Console Categories (cli tables)</h3>
                <button className="btn-add-item" onClick={addCategory}>
                  <Plus size={14} /> Add Category
                </button>
              </div>
              <p className="section-instruction">
                Manage categories output when running the <code>skills</code> command inside the interactive command console.
              </p>

              <div className="categories-list-editor">
                {localConfig.skillsCategories.map((cat: any, idx: number) => (
                  <div className="category-row-editor" key={idx}>
                    <div className="form-group cat-name-group">
                      <label>Category Label</label>
                      <input 
                        type="text" 
                        value={cat.category} 
                        onChange={(e) => handleCategoryChange(idx, 'category', e.target.value)} 
                      />
                    </div>
                    <div className="form-group cat-skills-group">
                      <label>Skills (comma separated list)</label>
                      <input 
                        type="text" 
                        value={cat.skills} 
                        onChange={(e) => handleCategoryChange(idx, 'skills', e.target.value)} 
                      />
                    </div>
                    <button className="btn-delete-row" onClick={() => removeCategory(idx)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PROJECTS & CERTS */}
          {activeTab === 'projects' && (
            <div className="tab-pane">
              <div className="header-with-action">
                <h3>Projects Showcase</h3>
                <button className="btn-add-item" onClick={addProject}>
                  <Plus size={14} /> Add Project
                </button>
              </div>

              <div className="projects-list-editor">
                {localConfig.projects.map((proj: any, idx: number) => (
                  <div className="project-card-editor" key={idx}>
                    <div className="card-editor-header">
                      <h4>Project Card #{idx + 1}: {proj.title}</h4>
                      <button className="btn-delete-card" onClick={() => removeProject(idx)}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                    <div className="form-group-row">
                      <div className="form-group">
                        <label>Project Title</label>
                        <input 
                          type="text" 
                          value={proj.title} 
                          onChange={(e) => handleProjectChange(idx, 'title', e.target.value)} 
                        />
                      </div>
                      <div className="form-group">
                        <label>Redirect/Storefront URL</label>
                        <input 
                          type="text" 
                          value={proj.url} 
                          onChange={(e) => handleProjectChange(idx, 'url', e.target.value)} 
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Workflow Description (Simple English)</label>
                      <textarea 
                        rows={3} 
                        value={proj.description} 
                        onChange={(e) => handleProjectChange(idx, 'description', e.target.value)} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Technology Components Stack (comma separated)</label>
                      <input 
                        type="text" 
                        value={proj.tech.join(', ')} 
                        onChange={(e) => handleProjectChange(idx, 'tech', e.target.value)} 
                      />
                    </div>
                  </div>
                ))}
              </div>

              <hr className="divider" />

              <div className="header-with-action">
                <h3>Active Course Certifications</h3>
                <button className="btn-add-item" onClick={addCert}>
                  <Plus size={14} /> Add Certification
                </button>
              </div>

              <div className="certs-list-editor">
                {localConfig.certifications.map((cert: string, idx: number) => (
                  <div className="cert-row-editor" key={idx}>
                    <input 
                      type="text" 
                      value={cert} 
                      onChange={(e) => handleCertChange(idx, e.target.value)} 
                    />
                    <button className="btn-delete-row" onClick={() => removeCert(idx)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: WORK EXPERIENCE */}
          {activeTab === 'experience' && (
            <div className="tab-pane">
              <div className="header-with-action">
                <h3>Professional Work Experience Timeline</h3>
                <button className="btn-add-item" onClick={addJob}>
                  <Plus size={14} /> Add New Job profile
                </button>
              </div>

              <div className="jobs-list-editor">
                {localConfig.experience.map((job: any, jobIdx: number) => (
                  <div className="job-card-editor" key={jobIdx}>
                    <div className="card-editor-header">
                      <h4>Job Profile #{jobIdx + 1}: {job.company}</h4>
                      <button className="btn-delete-card" onClick={() => removeJob(jobIdx)}>
                        <Trash2 size={14} /> Remove Job
                      </button>
                    </div>

                    <div className="form-group-row">
                      <div className="form-group">
                        <label>Role/Job Title</label>
                        <input 
                          type="text" 
                          value={job.role} 
                          onChange={(e) => handleExperienceChange(jobIdx, 'role', e.target.value)} 
                        />
                      </div>
                      <div className="form-group">
                        <label>Company/Institution</label>
                        <input 
                          type="text" 
                          value={job.company} 
                          onChange={(e) => handleExperienceChange(jobIdx, 'company', e.target.value)} 
                        />
                      </div>
                      <div className="form-group">
                        <label>Duration Tenure</label>
                        <input 
                          type="text" 
                          value={job.duration} 
                          onChange={(e) => handleExperienceChange(jobIdx, 'duration', e.target.value)} 
                        />
                      </div>
                    </div>

                    <div className="job-tasks-editor">
                      <div className="header-with-action-sub">
                        <h5>Key Responsibilities logs</h5>
                        <button className="btn-add-task-item" onClick={() => addTask(jobIdx)}>
                          <Plus size={12} /> Add log line
                        </button>
                      </div>
                      
                      {job.tasks.map((task: string, taskIdx: number) => (
                        <div className="task-row-editor" key={taskIdx}>
                          <input 
                            type="text" 
                            value={task} 
                            onChange={(e) => handleTaskChange(jobIdx, taskIdx, e.target.value)} 
                          />
                          <button className="btn-delete-task-row" onClick={() => removeTask(jobIdx, taskIdx)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin;
