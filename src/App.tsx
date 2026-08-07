import React from 'react';
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
import './App.css';

function App() {
  React.useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="app-root-container">
      {/* Dynamic particles & custom cursor */}
      <Cursor />
      
      {/* Global CSS background grid layer */}
      <div className="grid-bg"></div>
      
      {/* Header bar navigation links */}
      <Navbar />
      
      {/* Main dashboard panels container */}
      <main className="main-content-flow">
        <Landing />
        <About />
        <Skills />
        <Pipelines />
        <Projects />
        <Experience />
        <Credentials />
        <Contact />
      </main>

      {/* Footer bar console meta */}
      <footer className="footer-credits">
        <div className="container footer-flex">
          <p className="footer-copyright">
            <span className="console-prefix">&copy; {new Date().getFullYear()}</span> abhishek-sharma-portfolio ~ all deployment pipelines operational.
          </p>
          <span className="footer-latency">latency: 14ms | cluster: ap-south-1</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
