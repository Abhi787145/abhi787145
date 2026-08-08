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

function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#/');
  const [config, setConfig] = useState<any>(initialConfig);
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
      try {
        const saved = localStorage.getItem('portfolio_config');
        if (saved) {
          setConfig(JSON.parse(saved));
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Failed to read from localStorage:', e);
      }

      try {
        const response = await fetch('./portfolio-config.json');
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
        }
      } catch (e) {
        console.error('Failed to fetch default config:', e);
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
