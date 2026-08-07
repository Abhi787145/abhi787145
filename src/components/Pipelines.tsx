import React, { useState, useEffect, useRef } from 'react';
import { Play, Terminal, CheckCircle2, Activity, FileCode, ShieldCheck, HelpCircle } from 'lucide-react';
import './styles/Pipelines.css';

type PipelineStep = {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'success' | 'failed';
  icon: any;
  duration: number;
};

type BuildHistory = {
  commit: string;
  message: string;
  time: string;
  duration: string;
  status: 'SUCCESS' | 'FAILED';
};

const Pipelines = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(-1);
  const [logContent, setLogContent] = useState<string>('System idle. Ready to trigger pipeline.');
  const [totalSecs, setTotalSecs] = useState(0);
  const consoleRef = useRef<HTMLDivElement>(null);
  
  const [steps, setSteps] = useState<PipelineStep[]>([
    { id: 'checkout', name: 'Checkout', status: 'idle', icon: FileCode, duration: 2 },
    { id: 'lint', name: 'Lint & Test', status: 'idle', icon: Terminal, duration: 3 },
    { id: 'scan', name: 'Security Scan', status: 'idle', icon: ShieldCheck, duration: 3 },
    { id: 'deploy', name: 'Deploy Cloud', status: 'idle', icon: CheckCircle2, duration: 4 }
  ]);

  const [history, setHistory] = useState<BuildHistory[]>([
    { commit: 'f9a2e8c', message: 'feat: add WhatsApp API sync service', time: '10 mins ago', duration: '12s', status: 'SUCCESS' },
    { commit: '0bc192d', message: 'fix: resolve AWS Lambda CORS headers', time: '2 hours ago', duration: '14s', status: 'SUCCESS' },
    { commit: '4d8e90a', message: 'refactor: simplify database queries pool', time: '1 day ago', duration: '11s', status: 'SUCCESS' }
  ]);

  const runLogs: Record<string, string[]> = {
    checkout: [
      '[INFO] git fetch --tags --force --progress --depth=50 origin',
      '[INFO] Checking out revision d89a2b7c6198f7e8a9d18c39...1b',
      '[SUCCESS] git checkout completed in 1.4s',
      '[INFO] package.json lockfile hash matched. Skipping cache invalidation.'
    ],
    lint: [
      '[INFO] npm run lint:ci',
      '[INFO] Running code quality audits across tsx & styles...',
      '[SUCCESS] 0 lint errors, 0 warnings found.',
      '[INFO] npm run test:ci',
      '[SUCCESS] 14 unit tests passed cleanly.'
    ],
    scan: [
      '[INFO] trivy image --severity HIGH,CRITICAL abhishek/dropshipping-sync:latest',
      '[INFO] Analyzing base alpine layers & packages configurations...',
      '[INFO] Vulnerability Scanner: 0 critical vulnerabilities discovered.',
      '[SUCCESS] Container vulnerability scan passed compliance checks.'
    ],
    deploy: [
      '[INFO] aws lambda update-function-code --function-name InventorySyncProcessor',
      '[INFO] Syncing deployment bundle to S3 dropshipping-state-bucket...',
      '[INFO] Route53 health checks status check: OK (200)',
      '[SUCCESS] Traffic routed. New application version promoted globally.'
    ]
  };

  const startPipeline = () => {
    if (isRunning) return;
    setIsRunning(true);
    setCurrentStepIdx(0);
    setTotalSecs(0);
    setLogContent('Initializing build run context...\nPreparing ephemeral runner VM...');
    
    // Reset steps
    setSteps(prev => prev.map(s => ({ ...s, status: 'idle' })));
  };

  useEffect(() => {
    const handleTrigger = () => {
      startPipeline();
    };
    window.addEventListener('trigger-pipeline-sim', handleTrigger);
    return () => {
      window.removeEventListener('trigger-pipeline-sim', handleTrigger);
    };
  }, [isRunning, steps]);

  // Duration timer
  useEffect(() => {
    let timer: any;
    if (isRunning) {
      timer = setInterval(() => {
        setTotalSecs(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  // Step runner logic
  useEffect(() => {
    if (currentStepIdx < 0 || currentStepIdx >= steps.length) {
      if (currentStepIdx >= steps.length && isRunning) {
        setIsRunning(false);
        setCurrentStepIdx(-1);
        
        // Append to history
        const randomCommit = Math.random().toString(16).substring(2, 9);
        const newRun: BuildHistory = {
          commit: randomCommit,
          message: 'api: trigger sync run via dashboard',
          time: 'Just now',
          duration: `${totalSecs}s`,
          status: 'SUCCESS'
        };
        setHistory(prev => [newRun, ...prev.slice(0, 4)]);
        setLogContent(prev => prev + '\n\n[SUCCESS] Pipeline executed successfully. Deployment stable.');
      }
      return;
    }

    const currentStep = steps[currentStepIdx];
    
    // Set step status to running
    setSteps(prev => prev.map((s, idx) => idx === currentStepIdx ? { ...s, status: 'running' } : s));
    
    // Print initial logs for step
    setLogContent(prev => prev + `\n\n--- Stage: ${currentStep.name} ---`);
    
    let logIndex = 0;
    const logs = runLogs[currentStep.id] || [];
    
    const logInterval = setInterval(() => {
      if (logIndex < logs.length) {
        setLogContent(prev => prev + '\n' + logs[logIndex]);
        logIndex++;
      } else {
        clearInterval(logInterval);
        
        // Complete step
        setSteps(prev => prev.map((s, idx) => idx === currentStepIdx ? { ...s, status: 'success' } : s));
        
        // Go to next step
        setTimeout(() => {
          setCurrentStepIdx(prev => prev + 1);
        }, 800);
      }
    }, 700);

    return () => clearInterval(logInterval);
  }, [currentStepIdx]);

  // Auto-scroll logs
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logContent]);

  return (
    <section id="pipelines" className="pipelines-section container">
      <div className="section-title-wrapper">
        <span className="sec-label">ci/cd integration</span>
        <h3 className="sec-title">Active Deployment Pipelines</h3>
        <p className="sec-desc">Simulate automated CI/CD runs to build, scan, and deploy microservices infrastructure code.</p>
      </div>

      <div className="pipelines-dashboard-grid">
        <div className="pipelines-active-runner glass-panel">
          <div className="runner-header-bar">
            <div className="runner-title">
              <Activity className={`runner-pulse-icon ${isRunning ? 'spinning' : ''}`} />
              <span>Pipeline Runner: Node-04</span>
            </div>
            <span className={`runner-badge ${isRunning ? 'running-badge' : 'idle-badge'}`}>
              {isRunning ? 'RUNNING' : 'IDLE'}
            </span>
          </div>

          <div className="runner-stats-header">
            <div className="stat-unit">
              <span className="unit-val">{isRunning ? `${totalSecs}s` : '0s'}</span>
              <span className="unit-lbl">Execution Duration</span>
            </div>
            <div className="stat-unit">
              <span className="unit-val">100%</span>
              <span className="unit-lbl">Pass Threshold</span>
            </div>
            <div className="stat-unit">
              <span className="unit-val">{isRunning ? `${currentStepIdx + 1}/${steps.length}` : '0/4'}</span>
              <span className="unit-lbl">Steps Processed</span>
            </div>
          </div>

          <div className="runner-flow-line-bar">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <React.Fragment key={step.id}>
                  <div className={`r-step ${step.status}`}>
                    <div className="r-icon">
                      <StepIcon size={18} />
                    </div>
                    <span className="r-name">{step.name}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="r-connector">
                      <div 
                        className="r-fill" 
                        style={{ 
                          width: step.status === 'success' ? '100%' : step.status === 'running' ? '50%' : '0%' 
                        }}
                      ></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="runner-action-trigger">
            <button 
              className="btn-trigger-run" 
              onClick={startPipeline} 
              disabled={isRunning}
            >
              <Play size={16} fill="currentColor" /> {isRunning ? 'Running Build Task...' : 'Trigger Pipeline Run'}
            </button>
          </div>

          <div className="runner-log-console">
            <div className="console-bar">
              <span className="console-tab-name">
                <Terminal size={14} /> pipeline-traces --follow
              </span>
              <span className="console-timestamp">ANSI utf-8</span>
            </div>
            <div className="console-output-area" ref={consoleRef}>
              {logContent}
            </div>
          </div>
        </div>

        <div className="deployments-history-box glass-panel">
          <div className="history-header">
            <h4>Deployment History</h4>
          </div>
          <div className="history-list">
            {history.map((run, idx) => (
              <div className="history-row" key={idx}>
                <div className="history-meta">
                  <span className="history-commit">
                    <FileCode size={12} /> {run.commit}
                  </span>
                  <span className="history-time">{run.time}</span>
                </div>
                <p className="history-msg">{run.message}</p>
                <div className="history-stats-row">
                  <span className="history-duration">Duration: {run.duration}</span>
                  <span className="history-status-tag">SUCCESS</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pipelines;
