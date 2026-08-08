import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Save, Download, RotateCcw, Plus, Trash2, ArrowUp, ArrowDown,
  User, Cpu, Briefcase, FolderGit2, ShieldCheck, Check, AlertCircle,
  Palette, Tag, History, Undo2, RefreshCw, GitCompare, Sparkles, X
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

const AVAILABLE_THEMES = [
  { id: 'cyber-cyan', name: 'Cyber Cyan', desc: 'Neon Blue & Cyan Glow (Default)', color: '#00f2fe' },
  { id: 'matrix-green', name: 'Matrix Green', desc: 'Terminal Hacker Emerald Glow', color: '#10b981' },
  { id: 'synthwave-purple', name: 'Synthwave Neon', desc: 'Retro Violet & Magenta Glow', color: '#c084fc' },
  { id: 'crimson-flame', name: 'Crimson Flame', desc: 'Stealth Dark Red & Amber Glow', color: '#f43f5e' },
  { id: 'midnight-stealth', name: 'Midnight Stealth', desc: 'Minimalist Titanium Obsidian', color: '#94a3b8' }
];

const TITLE_PRESETS: Record<string, string[]> = {
  'devops': ['DevOps Engineer', 'Cloud Infrastructure Architect', 'CI/CD Pipeline Specialist', 'Database & Observability Admin'],
  'fullstack': ['Full Stack Developer', 'React & Node.js Engineer', 'Cloud Software Architect', 'UI/UX & Frontend Specialist'],
  'ai_data': ['Machine Learning Engineer', 'Data Platform Architect', 'AI Solutions Developer', 'Data Infrastructure Specialist'],
  'security': ['Cyber Security Specialist', 'SecOps & Cloud Defender', 'Penetration Tester', 'Infrastructure Security Engineer']
};

const Admin = ({ config, setConfig }: AdminProps) => {
  const [authRole, setAuthRole] = useState<'admin' | 'viewer' | null>(() => {
    return sessionStorage.getItem('admin_auth_role') as 'admin' | 'viewer' | null;
  });
  const [passcode, setPasscode] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'viewer'>('viewer');
  const [loginError, setLoginError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Base configuration state for diffing and targeted reverting
  const [baseConfig, setBaseConfig] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'skills' | 'projects' | 'experience' | 'changes'>('profile');
  const [localConfig, setLocalConfig] = useState(JSON.parse(JSON.stringify(config)));
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });
  const [newTitleInput, setNewTitleInput] = useState('');

  // Fetch official base config from server on mount
  useEffect(() => {
    const fetchBase = async () => {
      try {
        const res = await fetch('./portfolio-config.json');
        if (res.ok) {
          const data = await res.json();
          setBaseConfig(data);
        }
      } catch (e) {
        console.warn('Failed to load base configuration for diffing', e);
      }
    };
    fetchBase();
  }, []);

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
      if (selectedRole === 'viewer') {
        sessionStorage.setItem('admin_authenticated', 'true');
        sessionStorage.setItem('admin_auth_role', 'viewer');
        setAuthRole('viewer');
      } else {
        const hashed = await sha256(passcode);
        const adminHash = config?.settings?.adminHash || '9bf18b507b74f26b64c36b4d3205af08b70e5ac0826399432561a3c8c4ddb55e';
        if (hashed === adminHash) {
          sessionStorage.setItem('admin_authenticated', 'true');
          sessionStorage.setItem('admin_auth_role', 'admin');
          setAuthRole('admin');
        } else {
          setLoginError('Access Denied: Invalid Decryption Key');
        }
      }
    } catch (err) {
      setLoginError('Authentication engine error. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const isAuthorized = authRole !== null;
  const isReadOnly = authRole === 'viewer';
  const showGuestOption = config?.settings?.enableGuestViewer !== false;

  const showStatus = (text: string, type: 'success' | 'error') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage({ text: '', type: '' }), 4000);
  };

  // Compute detected differences between local session and base config
  const computeDiffs = () => {
    if (!baseConfig) return [];
    const diffs: Array<{
      id: string;
      category: string;
      label: string;
      oldVal: string;
      newVal: string;
      revertFn: () => void;
    }> = [];

    // Profile checks
    const profileKeys = [
      { key: 'name', label: 'Full Name' },
      { key: 'role', label: 'Job Title' },
      { key: 'summary', label: 'Bio Summary' },
      { key: 'email', label: 'Email' },
      { key: 'formspreeId', label: 'Formspree ID' },
      { key: 'linkedin', label: 'LinkedIn URL' },
      { key: 'github', label: 'GitHub URL' }
    ];

    profileKeys.forEach(({ key, label }) => {
      const oldV = baseConfig?.profile?.[key] || '';
      const newV = localConfig?.profile?.[key] || '';
      if (oldV !== newV) {
        diffs.push({
          id: `profile-${key}`,
          category: 'Profile Info',
          label,
          oldVal: oldV || '(empty)',
          newVal: newV || '(empty)',
          revertFn: () => {
            setLocalConfig((prev: any) => ({
              ...prev,
              profile: { ...prev.profile, [key]: baseConfig.profile[key] }
            }));
            showStatus(`Reverted ${label} to official configuration.`, 'success');
          }
        });
      }
    });

    // Theme check
    const oldTheme = baseConfig?.theme || 'cyber-cyan';
    const newTheme = localConfig?.theme || 'cyber-cyan';
    if (oldTheme !== newTheme) {
      diffs.push({
        id: 'theme',
        category: 'Aesthetic Theme',
        label: 'Color Palette',
        oldVal: oldTheme,
        newVal: newTheme,
        revertFn: () => {
          setLocalConfig((prev: any) => ({ ...prev, theme: oldTheme }));
          showStatus('Reverted theme to official configuration.', 'success');
        }
      });
    }

    // Rotating Titles check
    const oldTitles = JSON.stringify(baseConfig?.titles || []);
    const newTitles = JSON.stringify(localConfig?.titles || []);
    if (oldTitles !== newTitles) {
      diffs.push({
        id: 'titles',
        category: 'Hero Rotating Titles',
        label: 'Position Subtitles',
        oldVal: (baseConfig?.titles || []).join(', '),
        newVal: (localConfig?.titles || []).join(', '),
        revertFn: () => {
          setLocalConfig((prev: any) => ({ ...prev, titles: JSON.parse(JSON.stringify(baseConfig.titles || [])) }));
          showStatus('Reverted rotating titles to official configuration.', 'success');
        }
      });
    }

    // Sections Order & Visibility
    const oldSections = JSON.stringify(baseConfig?.sections || []);
    const newSections = JSON.stringify(localConfig?.sections || []);
    if (oldSections !== newSections) {
      diffs.push({
        id: 'sections',
        category: 'Layout Flow',
        label: 'Section Ordering & Visibility',
        oldVal: `${(baseConfig?.sections || []).length} active sections: ${(baseConfig?.sections || []).join(' > ')}`,
        newVal: `${(localConfig?.sections || []).length} active sections: ${(localConfig?.sections || []).join(' > ')}`,
        revertFn: () => {
          setLocalConfig((prev: any) => ({ ...prev, sections: JSON.parse(JSON.stringify(baseConfig.sections || [])) }));
          showStatus('Reverted layout sections to official configuration.', 'success');
        }
      });
    }

    // Skills Matrix check
    const oldSkills = JSON.stringify(baseConfig?.skills || []);
    const newSkills = JSON.stringify(localConfig?.skills || []);
    if (oldSkills !== newSkills) {
      diffs.push({
        id: 'skills',
        category: 'Skills Matrix',
        label: '3D Spheres & CLI Matrix',
        oldVal: `${(baseConfig?.skills || []).length} balls configured`,
        newVal: `${(localConfig?.skills || []).length} balls configured`,
        revertFn: () => {
          setLocalConfig((prev: any) => ({
            ...prev,
            skills: JSON.parse(JSON.stringify(baseConfig.skills || [])),
            cliSkills: JSON.parse(JSON.stringify(baseConfig.cliSkills || {}))
          }));
          showStatus('Reverted skills matrix to official configuration.', 'success');
        }
      });
    }

    // Projects Showcase check
    const oldProjects = JSON.stringify(baseConfig?.projects || []);
    const newProjects = JSON.stringify(localConfig?.projects || []);
    if (oldProjects !== newProjects) {
      diffs.push({
        id: 'projects',
        category: 'Projects Showcase',
        label: 'Project Cards List',
        oldVal: `${(baseConfig?.projects || []).length} projects`,
        newVal: `${(localConfig?.projects || []).length} projects`,
        revertFn: () => {
          setLocalConfig((prev: any) => ({ ...prev, projects: JSON.parse(JSON.stringify(baseConfig.projects || [])) }));
          showStatus('Reverted project cards to official configuration.', 'success');
        }
      });
    }

    // Experience Timeline check
    const oldExp = JSON.stringify(baseConfig?.experience || []);
    const newExp = JSON.stringify(localConfig?.experience || []);
    if (oldExp !== newExp) {
      diffs.push({
        id: 'experience',
        category: 'Work Timeline',
        label: 'Career History Roles',
        oldVal: `${(baseConfig?.experience || []).length} job roles`,
        newVal: `${(localConfig?.experience || []).length} job roles`,
        revertFn: () => {
          setLocalConfig((prev: any) => ({ ...prev, experience: JSON.parse(JSON.stringify(baseConfig.experience || [])) }));
          showStatus('Reverted experience timeline to official configuration.', 'success');
        }
      });
    }

    // Credentials / Certifications check
    const oldCerts = JSON.stringify(baseConfig?.credentials?.certifications || []);
    const newCerts = JSON.stringify(localConfig?.credentials?.certifications || []);
    if (oldCerts !== newCerts) {
      diffs.push({
        id: 'credentials',
        category: 'Certifications',
        label: 'Credentials List',
        oldVal: `${(baseConfig?.credentials?.certifications || []).length} certificates`,
        newVal: `${(localConfig?.credentials?.certifications || []).length} certificates`,
        revertFn: () => {
          setLocalConfig((prev: any) => ({
            ...prev,
            credentials: {
              ...prev.credentials,
              certifications: JSON.parse(JSON.stringify(baseConfig.credentials?.certifications || []))
            }
          }));
          showStatus('Reverted certifications to official configuration.', 'success');
        }
      });
    }

    return diffs;
  };

  const detectedDiffs = computeDiffs();

  // Revert all changes back to base
  const handleDiscardAllChanges = () => {
    if (!baseConfig) return;
    if (window.confirm('Discard all local changes and revert back to official repository configuration?')) {
      setLocalConfig(JSON.parse(JSON.stringify(baseConfig)));
      showStatus('All modifications discarded. Restored official configuration values.', 'success');
    }
  };

  // Section Order handlers
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const list = [...localConfig.sections];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    setLocalConfig((prev: any) => ({ ...prev, sections: list }));
  };

  const toggleSectionVisibility = (id: string) => {
    const list = [...localConfig.sections];
    const index = list.indexOf(id);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(id);
    }
    setLocalConfig((prev: any) => ({ ...prev, sections: list }));
  };

  // Profile Field handlers
  const handleProfileChange = (field: string, val: string) => {
    setLocalConfig((prev: any) => ({
      ...prev,
      profile: { ...prev.profile, [field]: val }
    }));
  };

  // Rotating Titles handlers
  const handleAddTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleInput.trim()) return;
    const current = localConfig.titles || [];
    if (!current.includes(newTitleInput.trim())) {
      setLocalConfig((prev: any) => ({
        ...prev,
        titles: [...current, newTitleInput.trim()]
      }));
      setNewTitleInput('');
    }
  };

  const handleRemoveTitle = (titleToRemove: string) => {
    setLocalConfig((prev: any) => ({
      ...prev,
      titles: (prev.titles || []).filter((t: string) => t !== titleToRemove)
    }));
  };

  const handleApplyPreset = (presetKey: string) => {
    if (TITLE_PRESETS[presetKey]) {
      setLocalConfig((prev: any) => ({
        ...prev,
        titles: [...TITLE_PRESETS[presetKey]]
      }));
      showStatus(`Applied preset position titles for ${presetKey}!`, 'success');
    }
  };

  // 3D Skill Spheres handlers
  const handleSkillChange = (index: number, field: 'name' | 'bg', val: string) => {
    const updated = [...localConfig.skills];
    updated[index] = { ...updated[index], [field]: val };
    setLocalConfig((prev: any) => ({ ...prev, skills: updated }));
  };

  const addSkill = () => {
    setLocalConfig((prev: any) => ({
      ...prev,
      skills: [...prev.skills, { name: 'New Skill', bg: '#0A1224' }]
    }));
  };

  const removeSkill = (index: number) => {
    const updated = localConfig.skills.filter((_: any, idx: number) => idx !== index);
    setLocalConfig((prev: any) => ({ ...prev, skills: updated }));
  };

  // CLI Skills Category handlers
  const handleCliCategoryNameChange = (oldName: string, newName: string) => {
    if (!newName.trim() || oldName === newName) return;
    const current = { ...localConfig.cliSkills };
    const items = current[oldName] || [];
    delete current[oldName];
    current[newName] = items;
    setLocalConfig((prev: any) => ({ ...prev, cliSkills: current }));
  };

  const handleCliSkillsChange = (catName: string, commaString: string) => {
    const array = commaString.split(',').map(s => s.trim());
    setLocalConfig((prev: any) => ({
      ...prev,
      cliSkills: { ...prev.cliSkills, [catName]: array }
    }));
  };

  const addCliCategory = () => {
    const catName = `Category_${Object.keys(localConfig.cliSkills || {}).length + 1}`;
    setLocalConfig((prev: any) => ({
      ...prev,
      cliSkills: { ...prev.cliSkills, [catName]: ['Tool 1', 'Tool 2'] }
    }));
  };

  const removeCliCategory = (catName: string) => {
    const current = { ...localConfig.cliSkills };
    delete current[catName];
    setLocalConfig((prev: any) => ({ ...prev, cliSkills: current }));
  };

  // Projects handlers
  const handleProjectChange = (index: number, field: string, val: any) => {
    const updated = [...localConfig.projects];
    updated[index] = { ...updated[index], [field]: val };
    setLocalConfig((prev: any) => ({ ...prev, projects: updated }));
  };

  const addProject = () => {
    setLocalConfig((prev: any) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: `project-${Date.now()}`,
          title: 'New Cloud Project',
          desc: 'Automated infrastructure pipeline and deployment architecture.',
          tags: ['AWS', 'Terraform', 'Docker'],
          liveUrl: 'https://example.com',
          repoUrl: 'https://github.com/example'
        }
      ]
    }));
  };

  const removeProject = (index: number) => {
    const updated = localConfig.projects.filter((_: any, idx: number) => idx !== index);
    setLocalConfig((prev: any) => ({ ...prev, projects: updated }));
  };

  // Experience handlers
  const handleJobChange = (index: number, field: string, val: any) => {
    const updated = [...localConfig.experience];
    updated[index] = { ...updated[index], [field]: val };
    setLocalConfig((prev: any) => ({ ...prev, experience: updated }));
  };

  const handleTaskChange = (jobIndex: number, taskIndex: number, val: string) => {
    const updated = [...localConfig.experience];
    const tasks = [...updated[jobIndex].tasks];
    tasks[taskIndex] = val;
    updated[jobIndex].tasks = tasks;
    setLocalConfig((prev: any) => ({ ...prev, experience: updated }));
  };

  const addTask = (jobIndex: number) => {
    const updated = [...localConfig.experience];
    updated[jobIndex].tasks.push('Executed automated operations.');
    setLocalConfig((prev: any) => ({ ...prev, experience: updated }));
  };

  const removeTask = (jobIndex: number, taskIndex: number) => {
    const updated = [...localConfig.experience];
    updated[jobIndex].tasks.splice(taskIndex, 1);
    setLocalConfig((prev: any) => ({ ...prev, experience: updated }));
  };

  const addJob = () => {
    setLocalConfig((prev: any) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          role: 'Senior DevOps Specialist',
          company: 'Cloud Corp Inc.',
          period: '2024 - PRESENT',
          status: 'SUCCESS',
          tasks: ['Automated cloud infrastructure deployments using Terraform.']
        }
      ]
    }));
  };

  const removeJob = (index: number) => {
    const updated = localConfig.experience.filter((_: any, idx: number) => idx !== index);
    setLocalConfig((prev: any) => ({ ...prev, experience: updated }));
  };

  // Certifications handlers
  const handleCertChange = (index: number, val: string) => {
    const updated = [...(localConfig.credentials?.certifications || [])];
    updated[index] = val;
    setLocalConfig((prev: any) => ({
      ...prev,
      credentials: { ...prev.credentials, certifications: updated }
    }));
  };

  const addCert = () => {
    const updated = [...(localConfig.credentials?.certifications || []), 'New Industry Certification'];
    setLocalConfig((prev: any) => ({
      ...prev,
      credentials: { ...prev.credentials, certifications: updated }
    }));
  };

  const removeCert = (index: number) => {
    const updated = (localConfig.credentials?.certifications || []).filter((_: any, idx: number) => idx !== index);
    setLocalConfig((prev: any) => ({
      ...prev,
      credentials: { ...prev.credentials, certifications: updated }
    }));
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
    if (window.confirm('Reset all changes and reload base repository config?')) {
      localStorage.removeItem('portfolio_config');
      try {
        const response = await fetch('./portfolio-config.json');
        if (response.ok) {
          const data = await response.json();
          setLocalConfig(data);
          setConfig(data);
          showStatus('Reset completed successfully. Restored repository config.', 'success');
        }
      } catch (e) {
        showStatus('Restored browser default settings.', 'success');
        window.location.reload();
      }
    }
  };

  // Render Login Screen if not authorized
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

          {showGuestOption && (
            <div className="role-selector-bar">
              <button 
                type="button" 
                className={`role-tab ${selectedRole === 'viewer' ? 'active' : ''}`}
                onClick={() => { setSelectedRole('viewer'); setLoginError(''); }}
              >
                Guest Viewer
              </button>
              <button 
                type="button" 
                className={`role-tab ${selectedRole === 'admin' ? 'active' : ''}`}
                onClick={() => { setSelectedRole('admin'); setLoginError(''); }}
              >
                Administrator
              </button>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="login-form">
            {(!showGuestOption || selectedRole === 'admin') ? (
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
            ) : (
              <p className="login-guest-info" style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                fontFamily: 'monospace',
                textAlign: 'center',
                lineHeight: '1.4',
                marginBottom: '8px'
              }}>
                Authenticate with read-only access to browse layout configuration matrices, timelines, and credentials lists.
              </p>
            )}
            
            {loginError && (
              <div className="login-error-message">
                <AlertCircle size={14} />
                <span>{loginError}</span>
              </div>
            )}

            <button type="submit" className="btn-action btn-apply btn-login-submit" disabled={isAuthenticating} style={{ width: '100%', justifyContent: 'center' }}>
              {isAuthenticating ? 'Decrypting...' : (!showGuestOption || selectedRole === 'admin') ? 'Decrypt Access' : 'Login as Viewer'}
            </button>
          </form>

          <a href="#/" className="btn-back btn-login-back" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', width: '100%' }}>
            <ArrowLeft size={16} /> Return to Portfolio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-dashboard-container ${isReadOnly ? 'read-only' : ''}`}>
      <header className="admin-header">
        <div className="admin-header-left">
          <a href="#/" className="btn-back" onClick={() => {
            sessionStorage.removeItem('admin_authenticated');
            sessionStorage.removeItem('admin_auth_role');
            setAuthRole(null);
          }}>
            <ArrowLeft size={16} /> Portfolio Home
          </a>
          <div className="admin-title-group">
            <h2>CloudOps CMS Console</h2>
            <span className="console-prefix">
              {isReadOnly 
                ? 'visitor-dev-environment // read-only session' 
                : 'visitor-dev-environment // write-access active'}
            </span>
          </div>
        </div>

        <div className="admin-actions">
          {!isReadOnly && (
            <button className="btn-action btn-apply" onClick={applyLive}>
              <Save size={16} /> Apply Live
            </button>
          )}
          <button className="btn-action btn-export" onClick={exportConfig}>
            <Download size={16} /> Export JSON
          </button>
          {!isReadOnly && (
            <button className="btn-action btn-reset" onClick={resetConfig}>
              <RotateCcw size={16} /> Reset defaults
            </button>
          )}
        </div>
      </header>

      {isReadOnly && (
        <div className="status-banner error" style={{ background: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)', color: '#60a5fa' }}>
          <AlertCircle size={18} style={{ color: '#60a5fa' }} />
          <span>READ-ONLY VIEW: You are logged in as a guest viewer. Edits and saves are disabled.</span>
        </div>
      )}

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
            <User size={18} /> Profile & Style
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
          <button 
            className={`sidebar-tab ${activeTab === 'changes' ? 'active' : ''}`}
            onClick={() => setActiveTab('changes')}
            style={{ position: 'relative' }}
          >
            <History size={18} /> Changes Tracker
            {detectedDiffs.length > 0 && (
              <span className="sidebar-tab-badge">{detectedDiffs.length}</span>
            )}
          </button>
        </aside>

        <main className="admin-main">
          <fieldset disabled={isReadOnly} style={{ border: 'none', padding: 0, margin: 0, width: '100%' }}>
            
            {/* TAB 1: PROFILE & AESTHETICS */}
            {activeTab === 'profile' && (
              <div className="tab-pane">
                {/* 1.1 Cyberpunk Theme Selector */}
                <div className="theme-selector-section">
                  <div className="section-title-with-badge">
                    <h3>Cyberpunk Color Themes</h3>
                    <span className="theme-active-tag">Active: {localConfig.theme || 'cyber-cyan'}</span>
                  </div>
                  <p className="section-instruction">
                    Select a curated cyberpunk theme palette to dynamically customize accent colors and glows across the whole portfolio.
                  </p>
                  
                  <div className="themes-grid">
                    {AVAILABLE_THEMES.map((th) => {
                      const isSelected = (localConfig.theme || 'cyber-cyan') === th.id;
                      return (
                        <div 
                          key={th.id}
                          className={`theme-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => !isReadOnly && setLocalConfig((p: any) => ({ ...p, theme: th.id }))}
                        >
                          <div className="theme-card-top">
                            <span className="theme-color-dot" style={{ background: th.color, boxShadow: `0 0 10px ${th.color}` }}></span>
                            <span className="theme-name">{th.name}</span>
                          </div>
                          <span className="theme-desc">{th.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <hr className="divider" />

                {/* 1.2 Rotating Titles Tag Editor */}
                <div className="titles-editor-section">
                  <div className="section-title-with-badge">
                    <h3>Universal Position Titles</h3>
                    <span className="theme-active-tag">Landing Subtitle Typewriter</span>
                  </div>
                  <p className="section-instruction">
                    Pick a 1-click preset or add custom job position titles to rotate under your name on the landing hero section.
                  </p>

                  <div className="preset-buttons-bar">
                    <span className="preset-label">Presets:</span>
                    <button type="button" className="btn-preset" onClick={() => handleApplyPreset('devops')}>DevOps & Cloud</button>
                    <button type="button" className="btn-preset" onClick={() => handleApplyPreset('fullstack')}>Full Stack Dev</button>
                    <button type="button" className="btn-preset" onClick={() => handleApplyPreset('ai_data')}>Data & AI/ML</button>
                    <button type="button" className="btn-preset" onClick={() => handleApplyPreset('security')}>Cyber Security</button>
                  </div>

                  <div className="titles-tags-list">
                    {(localConfig.titles || []).map((title: string, tIdx: number) => (
                      <span className="title-tag-chip" key={tIdx}>
                        {title}
                        {!isReadOnly && (
                          <button type="button" className="btn-remove-tag" onClick={() => handleRemoveTitle(title)}>
                            <X size={12} />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  {!isReadOnly && (
                    <form onSubmit={handleAddTitle} className="add-title-form">
                      <input 
                        type="text" 
                        placeholder="Add custom position title (e.g. Senior Site Reliability Engineer)..."
                        value={newTitleInput}
                        onChange={(e) => setNewTitleInput(e.target.value)}
                      />
                      <button type="submit" className="btn-add-tag-submit">
                        <Plus size={14} /> Add Title
                      </button>
                    </form>
                  )}
                </div>

                <hr className="divider" />

                {/* 1.3 Profile Information */}
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
                    <label>Formspree Form ID</label>
                    <input 
                      type="text" 
                      placeholder="e.g. mqazkypq"
                      value={localConfig.profile.formspreeId || ''} 
                      onChange={(e) => handleProfileChange('formspreeId', e.target.value)} 
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

                {/* 1.4 Layout Re-ordering */}
                <h3>Layout Section Alignment & Order</h3>
                <p className="section-instruction">
                  Re-order components using the arrow keys, or check/uncheck to hide sections from rendering on the live page.
                </p>
                <div className="sections-list">
                  {ALL_AVAILABLE_SECTIONS.map((section) => {
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
                              title="Move section up"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button 
                              className="btn-order-arrow" 
                              disabled={activeIndex === localConfig.sections.length - 1}
                              onClick={() => moveSection(activeIndex, 'down')}
                              title="Move section down"
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

            {/* TAB 2: SKILLS (3D BALLS & CLI) */}
            {activeTab === 'skills' && (
              <div className="tab-pane">
                <div className="header-with-action">
                  <div>
                    <h3>3D Interactive Tech Spheres</h3>
                    <p className="section-instruction">
                      Add, delete, and customize color schemes for the physics canvas. If a tool icon is missing, text will automatically render on the sphere in 3D.
                    </p>
                  </div>
                  <button className="btn-add-item" onClick={addSkill}>
                    <Plus size={14} /> Add 3D Ball
                  </button>
                </div>

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
                        <label>Tool / Technology Name</label>
                        <input 
                          type="text" 
                          value={skill.name} 
                          onChange={(e) => handleSkillChange(idx, 'name', e.target.value)} 
                        />
                      </div>

                      <div className="form-group">
                        <label>Sphere Color</label>
                        <select 
                          value={skill.bg} 
                          onChange={(e) => handleSkillChange(idx, 'bg', e.target.value)}
                        >
                          {PREDEFINED_COLORS.map(c => (
                            <option key={c.hex} value={c.hex}>{c.name} ({c.hex})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="divider" />

                <div className="header-with-action">
                  <div>
                    <h3>CloudOps CLI Output Categories</h3>
                    <p className="section-instruction">
                      Configure output categories and items that appear in the interactive terminal console.
                    </p>
                  </div>
                  <button className="btn-add-item" onClick={addCliCategory}>
                    <Plus size={14} /> Add Category
                  </button>
                </div>

                <div className="categories-list-editor">
                  {Object.entries(localConfig.cliSkills || {}).map(([catName, skillsList]: [string, any], idx: number) => (
                    <div className="category-row-editor" key={idx}>
                      <div className="form-group cat-name-group">
                        <label>Category Label</label>
                        <input 
                          type="text" 
                          defaultValue={catName} 
                          onBlur={(e) => handleCliCategoryNameChange(catName, e.target.value)} 
                        />
                      </div>
                      <div className="form-group cat-skills-group">
                        <label>Skills (comma separated)</label>
                        <input 
                          type="text" 
                          value={skillsList.join(', ')} 
                          onChange={(e) => handleCliSkillsChange(catName, e.target.value)} 
                        />
                      </div>
                      <button className="btn-delete-row" onClick={() => removeCliCategory(catName)}>
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
                  <div>
                    <h3>Projects Showcase</h3>
                    <p className="section-instruction">
                      Manage featured projects, e-commerce dropshipping portals, descriptions, and technology tags.
                    </p>
                  </div>
                  <button className="btn-add-item" onClick={addProject}>
                    <Plus size={14} /> Add Project
                  </button>
                </div>

                <div className="projects-list-editor">
                  {localConfig.projects.map((proj: any, idx: number) => (
                    <div className="project-card-editor" key={proj.id || idx}>
                      <div className="card-editor-header">
                        <span>Project #{idx + 1}: {proj.title}</span>
                        <button className="btn-delete-card" onClick={() => removeProject(idx)}>
                          <Trash2 size={14} /> Delete Project
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
                          <label>Live URL (e.g. ShopNexa Storefront)</label>
                          <input 
                            type="text" 
                            value={proj.liveUrl} 
                            onChange={(e) => handleProjectChange(idx, 'liveUrl', e.target.value)} 
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Project Description</label>
                        <textarea 
                          rows={3} 
                          value={proj.desc} 
                          onChange={(e) => handleProjectChange(idx, 'desc', e.target.value)} 
                        />
                      </div>

                      <div className="form-group-row">
                        <div className="form-group">
                          <label>Tech Stack Tags (comma separated)</label>
                          <input 
                            type="text" 
                            value={proj.tags?.join(', ') || ''} 
                            onChange={(e) => handleProjectChange(idx, 'tags', e.target.value.split(',').map((s: string) => s.trim()))} 
                          />
                        </div>
                        <div className="form-group">
                          <label>Repository / Source URL</label>
                          <input 
                            type="text" 
                            value={proj.repoUrl || ''} 
                            onChange={(e) => handleProjectChange(idx, 'repoUrl', e.target.value)} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="divider" />

                <div className="header-with-action">
                  <div>
                    <h3>Certifications & Badges</h3>
                    <p className="section-instruction">
                      List your official industry certifications and badges.
                    </p>
                  </div>
                  <button className="btn-add-item" onClick={addCert}>
                    <Plus size={14} /> Add Certification
                  </button>
                </div>

                <div className="certs-list-editor">
                  {(localConfig.credentials?.certifications || []).map((cert: string, idx: number) => (
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
                  <div>
                    <h3>Career History Timeline</h3>
                    <p className="section-instruction">
                      Manage jobs, contract positions, company names, and responsibility logs.
                    </p>
                  </div>
                  <button className="btn-add-item" onClick={addJob}>
                    <Plus size={14} /> Add Job Role
                  </button>
                </div>

                <div className="jobs-list-editor">
                  {localConfig.experience.map((job: any, jobIdx: number) => (
                    <div className="job-card-editor" key={jobIdx}>
                      <div className="card-editor-header">
                        <span>Career Log #{jobIdx + 1}: {job.role} @ {job.company}</span>
                        <button className="btn-delete-card" onClick={() => removeJob(jobIdx)}>
                          <Trash2 size={14} /> Delete Position
                        </button>
                      </div>

                      <div className="form-group-row">
                        <div className="form-group">
                          <label>Job Title</label>
                          <input 
                            type="text" 
                            value={job.role} 
                            onChange={(e) => handleJobChange(jobIdx, 'role', e.target.value)} 
                          />
                        </div>
                        <div className="form-group">
                          <label>Company / Organization</label>
                          <input 
                            type="text" 
                            value={job.company} 
                            onChange={(e) => handleJobChange(jobIdx, 'company', e.target.value)} 
                          />
                        </div>
                        <div className="form-group">
                          <label>Period / Timeframe</label>
                          <input 
                            type="text" 
                            value={job.period} 
                            onChange={(e) => handleJobChange(jobIdx, 'period', e.target.value)} 
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

            {/* TAB 5: CHANGES TRACKER & TARGETED REVERT */}
            {activeTab === 'changes' && (
              <div className="tab-pane">
                <div className="changes-header-bar">
                  <div>
                    <h3>Changes Tracker & Diff Inspector</h3>
                    <p className="section-instruction">
                      Inspect all modifications made in your active browser session compared against the official repository file.
                    </p>
                  </div>

                  {detectedDiffs.length > 0 && !isReadOnly && (
                    <button className="btn-discard-all" onClick={handleDiscardAllChanges}>
                      <Undo2 size={16} /> Discard All Changes
                    </button>
                  )}
                </div>

                {detectedDiffs.length === 0 ? (
                  <div className="clean-working-tree-card">
                    <Sparkles size={32} className="clean-icon" />
                    <h4>Working Tree is Clean</h4>
                    <p>No differences detected between your active browser settings and the official repository configuration file.</p>
                  </div>
                ) : (
                  <div className="diff-list-container">
                    <div className="diff-summary-bar">
                      <span>Detected <strong>{detectedDiffs.length}</strong> active modification(s):</span>
                    </div>

                    <div className="diff-items-grid">
                      {detectedDiffs.map((diff) => (
                        <div className="diff-card" key={diff.id}>
                          <div className="diff-card-header">
                            <div className="diff-badge-group">
                              <span className="diff-category-tag">{diff.category}</span>
                              <span className="diff-field-name">{diff.label}</span>
                            </div>
                            {!isReadOnly && (
                              <button className="btn-revert-single" onClick={diff.revertFn}>
                                <Undo2 size={14} /> Revert
                              </button>
                            )}
                          </div>

                          <div className="diff-comparison-box">
                            <div className="diff-side diff-old">
                              <span className="diff-label">Original:</span>
                              <div className="diff-content">{diff.oldVal}</div>
                            </div>
                            <div className="diff-arrow">➔</div>
                            <div className="diff-side diff-new">
                              <span className="diff-label">Modified:</span>
                              <div className="diff-content">{diff.newVal}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </fieldset>
        </main>
      </div>
    </div>
  );
};

export default Admin;
