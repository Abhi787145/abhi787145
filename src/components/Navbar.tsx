import React, { useState, useEffect } from 'react';
import './styles/Navbar.css';

type NavbarProps = {
  config: any;
};

const sectionLinks = [
  { id: 'landing', label: 'Overview', href: '#overview' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'skills', label: 'Infrastructure', href: '#infrastructure' },
  { id: 'pipelines', label: 'Pipelines', href: '#pipelines' },
  { id: 'projects', label: 'Projects', href: '#projects' },
  { id: 'experience', label: 'Experience', href: '#experience' },
  { id: 'credentials', label: 'Credentials', href: '#credentials' }
];

const Navbar = ({ config }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const logoName = config?.profile?.name 
    ? config.profile.name.toLowerCase().split(' ')[0] 
    : 'asharma';

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <a href="#" className="logo">
          <span className="console-prefix">devops-console:</span><span className="console-user">~{logoName}</span>
        </a>
        <nav className={`nav-menu ${mobileOpen ? 'open' : ''}`}>
          {config?.sections && sectionLinks.map(link => {
            if (config.sections.includes(link.id)) {
              return (
                <a key={link.id} href={link.href} className="nav-link" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </a>
              );
            }
            return null;
          })}
          {config?.sections?.includes('contact') && (
            <a href="#contact" className="nav-link contact-btn-nav" onClick={() => setMobileOpen(false)}>
              Contact Gateway
            </a>
          )}

        </nav>
        <button 
          className="mobile-toggle" 
          onClick={() => setMobileOpen(!mobileOpen)} 
          aria-label="Toggle Menu"
        >
          <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars-staggered'}`}></i>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
