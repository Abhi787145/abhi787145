import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Landing from './components/Landing';
import About from './components/About';
import Skills from './components/Skills';
import Pipelines from './components/Pipelines';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Credentials from './components/Credentials';
import Contact from './components/Contact';
import Cursor from './components/Cursor';
import Admin from './components/Admin';
import './App.css';

const initialConfig = {
  profile: {
    name: "Abhishek Sharma",
    role: "DevOps Engineer",
    summary: "",
    email: "",
    linkedin: "",
    github: ""
  },
  sections: [
    "landing",
    "about",
    "skills",
    "pipelines",
    "projects",
    "experience",
    "credentials",
    "contact"
  ],
  skills: [],
  skillsCategories: [],
  projects: [],
  experience: [],
  certifications: []
};

const App = () => {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#/');
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, [currentRoute]);

  useEffect(() => {
    const loadConfig = async () => {
      let baseData: any = null;
      try {
        const response = await fetch('./portfolio-config.json');
        if (response.ok) {
          baseData = await response.json();
        }
      } catch (e) {
        console.error('Failed to fetch default config:', e);
      }

      // Check if Cloud Firestore database is configured for real-time global sync
      const fbConfig = baseData?.settings?.firebaseConfig;
      if (fbConfig && fbConfig.projectId && fbConfig.apiKey) {
        try {
          const remoteData = await fetchRemotePortfolio(fbConfig);
          if (remoteData) {
            setConfig(remoteData);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('[Firebase] Remote fetch failed, falling back to local storage/config:', err);
        }
      }

      // Fallback to local storage (verifying 7-day retention)
      try {
        const saved = localStorage.getItem('portfolio_config');
        const savedTimestamp = localStorage.getItem('portfolio_config_timestamp');
        
        if (saved) {
          const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
          if (savedTimestamp && Date.now() - Number(savedTimestamp) > ONE_WEEK_MS) {
            console.log('[Retention] Local changes expired (>7 days old). Restoring clean repository config.');
            localStorage.removeItem('portfolio_config');
            localStorage.removeItem('portfolio_config_timestamp');
          } else {
            setConfig(JSON.parse(saved));
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error('Failed to read from localStorage:', e);
      }

      if (baseData) {
        setConfig(baseData);
      } else {
        setConfig(initialConfig);
      }
      setLoading(false);
    };

    loadConfig();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#04060a',
        color: '#64748b',
        fontFamily: 'monospace'
      }}>
        LOADING PORTFOLIO RUNTIME ENVIRONMENT...
      </div>
    );
  }

  if (currentRoute === '#/admin') {
    return <Admin config={config} setConfig={setConfig} />;
  }

  const sectionComponents: Record<string, React.ComponentType<any>> = {
    landing: Landing,
    about: About,
    skills: Skills,
    pipelines: Pipelines,
    projects: Projects,
    experience: Experience,
    credentials: Credentials,
    contact: Contact
  };

  return (
    <div className="app-root-container" data-theme={config?.theme || 'cyber-cyan'}>
      <Cursor />
      <div className="grid-bg"></div>
      <Navbar config={config} />
      
      <main className="main-content-flow">
        {config.sections.map((sectionId: string) => {
          const Component = sectionComponents[sectionId];
          return Component ? <Component key={sectionId} config={config} /> : null;
        })}
      </main>

      <footer className="footer-credits">
        <div className="container footer-flex">
          <p className="footer-copyright">
            <span className="console-prefix">&copy; {new Date().getFullYear()}</span> {config.profile.name.toLowerCase().replace(/\s+/g, '-')}-portfolio ~ all deployment pipelines operational.
          </p>
          <span className="footer-latency">latency: 14ms | cluster: ap-south-1</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
