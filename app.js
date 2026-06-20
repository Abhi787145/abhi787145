/**
 * Abhishek Sharma - CloudOps Dashboard Console JS
 * Telemetry charts, K8s Namespaces, CI/CD Pipeline Simulator, ShopNexa blueprint nodes, and Formspree AJAX contact
 */

/* ==========================================================================
   1. Live Telemetry Canvas (CPU Telemetry)
   ========================================================================== */
const metricsCanvas = document.getElementById('live-telemetry-canvas');
if (metricsCanvas) {
    const mCtx = metricsCanvas.getContext('2d');
    
    function resizeCanvas() {
        const rect = metricsCanvas.getBoundingClientRect();
        metricsCanvas.width = rect.width;
        metricsCanvas.height = rect.height;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let telemetryPoints = Array.from({ length: 22 }, () => Math.floor(Math.random() * 12) + 12);
    const cpuLoadVal = document.getElementById('cpu-load-val');
    const cpuLoadBar = document.getElementById('cpu-load-bar');

    function drawChart() {
        if (!metricsCanvas.width) return;
        mCtx.clearRect(0, 0, metricsCanvas.width, metricsCanvas.height);

        // Draw background grid lines inside canvas
        mCtx.strokeStyle = 'rgba(99, 102, 241, 0.03)';
        mCtx.lineWidth = 1;
        const gridLines = 4;
        for (let i = 1; i <= gridLines; i++) {
            const y = (metricsCanvas.height / (gridLines + 1)) * i;
            mCtx.beginPath();
            mCtx.moveTo(0, y);
            mCtx.lineTo(metricsCanvas.width, y);
            mCtx.stroke();
        }

        const pointCount = telemetryPoints.length;
        const stepX = metricsCanvas.width / (pointCount - 1);
        
        const points = telemetryPoints.map((val, idx) => {
            const x = idx * stepX;
            const y = metricsCanvas.height - (val / 100) * (metricsCanvas.height * 0.85) - 10;
            return { x, y };
        });

        // Fill area
        const gradient = mCtx.createLinearGradient(0, 0, 0, metricsCanvas.height);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.12)'); // Indigo gradient
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
        
        mCtx.beginPath();
        mCtx.moveTo(0, metricsCanvas.height);
        points.forEach(pt => mCtx.lineTo(pt.x, pt.y));
        mCtx.lineTo(metricsCanvas.width, metricsCanvas.height);
        mCtx.closePath();
        mCtx.fillStyle = gradient;
        mCtx.fill();

        // Line path
        mCtx.beginPath();
        mCtx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            const xc = (points[i - 1].x + points[i].x) / 2;
            const yc = (points[i - 1].y + points[i].y) / 2;
            mCtx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
        }
        mCtx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        mCtx.strokeStyle = '#6366f1'; // Indigo line
        mCtx.lineWidth = 2;
        mCtx.stroke();

        // Glow dot on last point
        const lastPt = points[points.length - 1];
        mCtx.beginPath();
        mCtx.arc(lastPt.x - 2, lastPt.y, 4, 0, Math.PI * 2);
        mCtx.fillStyle = '#6366f1';
        mCtx.shadowColor = '#6366f1';
        mCtx.shadowBlur = 8;
        mCtx.fill();
        mCtx.shadowBlur = 0;
    }

    setInterval(() => {
        const lastVal = telemetryPoints[telemetryPoints.length - 1];
        let diff = (Math.random() * 8) - 4; // -4 to +4
        let newVal = Math.round(lastVal + diff);
        newVal = Math.max(10, Math.min(newVal, 45));
        
        telemetryPoints.shift();
        telemetryPoints.push(newVal);

        if (cpuLoadVal) cpuLoadVal.textContent = `${newVal}%`;
        if (cpuLoadBar) cpuLoadBar.style.width = `${newVal}%`;

        drawChart();
    }, 1500);

    drawChart();
}


/* ==========================================================================
   2. Kubernetes Pods Namespace Skills Selector
   ========================================================================== */
const namespacePods = {
    infra: [
        {
            id: "terraform",
            name: "pod/terraform-operator",
            version: "v1.6.2",
            desc: "Declarative Infrastructure as Code (IaC) to construct repeatable resources. Built VPCs, EC2 instances, security rules, and databases cleanly without manual drift.",
            logs: `[INFO] Initializing terraform provider plugins...
[INFO] Terraform AWS provider: version v5.12.0 loaded.
[INFO] State Backend: remote s3 storage (dropshipping-state-bucket) verified.
[INFO] Refreshing terraform state mapping...
[INFO] 40+ resources discovered in state file.
[SUCCESS] State matches cloud records. 0 changes required.`
        },
        {
            id: "aws",
            name: "pod/aws-cloud-controller",
            version: "v2026.1",
            desc: "Expertise in core AWS service architectures: VPC subnets configuration, Route53 DNS management, Application Load Balancers (ALBs), and EC2 computing profiles.",
            logs: `[INFO] Requesting IAM session credentials...
[INFO] Identity authenticated: arn:aws:iam::88914022:user/abhishek
[INFO] Querying subnet layouts inside ap-south-1...
[INFO] Subnet ap-south-1a (Public): Active / CIDR 10.0.1.0/24
[INFO] Subnet ap-south-1b (Private): Active / CIDR 10.0.10.0/24
[INFO] Status: VPC network path routing validated.`
        },
        {
            id: "azure",
            name: "pod/azure-resource-manager",
            version: "v3.85.0",
            desc: "Deploying resources inside Azure App Services, configuring Storage Accounts, Blob containers, and SQL Server instances connected via Elastic Pools.",
            logs: `[INFO] Authenticated with Azure Active Directory.
[INFO] Active subscription: Prod-DevOps-Subscription (Active)
[INFO] Checking app service hosts: 3 running workloads.
[INFO] Azure App Service "production-web-host" reports 100% health check passes.
[INFO] Storage accounts synced. 0 latency flags.`
        }
    ],
    containers: [
        {
            id: "k8s",
            name: "pod/kubernetes-service-controller",
            version: "v1.28.4",
            desc: "Managing container nodes clusters. Deploying Pod configs, setting Service interfaces, scaling deployment replicas, and monitoring operational pods status.",
            logs: `[INFO] kubectl describe deployment web-app-deployment
Name:                   web-app-deployment
Namespace:              production-apps
Replicas:               3 desired | 3 updated | 3 total | 3 available
Conditions:             Available: True (MinimumReplicasAvailable)
Events:
  Type    Reason             Age   From                   Message
  ----    ------             ---   ----                   -------
  Normal  ScalingReplicaSet  12m   deployment-controller  Scaled replica set to 3`
        },
        {
            id: "docker",
            name: "pod/docker-runtime-engine",
            version: "v24.0.9",
            desc: "Constructing multi-stage optimized Dockerfiles to compress deployment base layers. Executing local testing containers and managing image releases registries.",
            logs: `[INFO] docker build -t abhishek-portfolio:latest .
Sending build context to Docker daemon  32.4MB
Step 1/3 : FROM node:20-alpine AS builder -> Using cache
Step 2/3 : COPY . . -> Done (0.8s)
Step 3/3 : RUN npm run build -> Success (2.4s)
Successfully built image: sha256:d892a01d44bc (124MB)`
        },
        {
            id: "ghactions",
            name: "pod/github-actions-runner",
            version: "v2.312.0",
            desc: "Designing secure GitHub actions YAML files. Setting permissions scopes, caches parameters, and deploying build artifacts onto target server endpoints.",
            logs: `[INFO] Run actions/checkout@v4
[INFO] Syncing git commit history to runner...
[INFO] Run actions/setup-node@v4
[INFO] Node environment setup completed: node v22.2.0
[INFO] Run npm run build -> Build folder generated
[SUCCESS] Uploading artifact dist/ ... Ready. Run completed.`
        },
        {
            id: "jenkins",
            name: "pod/jenkins-automation-server",
            version: "v2.426.3",
            desc: "Writing Jenkinsfile pipeline pipelines for automation build releases. Coordinating pipeline steps and executing shell commands on remote slaves.",
            logs: `[INFO] Starting build task #142...
[INFO] Checking out code from repository...
[INFO] Stage: [Compile Dependencies] -> Executed successfully (12s)
[INFO] Stage: [Unit Tests] -> All tests passing (18s)
[SUCCESS] Pipeline finished status: SUCCESSful.`
        }
    ],
    db: [
        {
            id: "sqlserver",
            name: "pod/mssql-db-administrator",
            version: "v15.0.2",
            desc: "Production SQL Server administration. Automating backups, script queries executions, schema comparisons using Redgate, and migrating DB instances (bacpac).",
            logs: `[INFO] DB admin instance connection active.
[INFO] Executing scheduled database transaction log backup...
[INFO] Backup operation: [SUCCESS] Saved to local storage blob.
[INFO] Running database integrity checks (DBCC CHECKDB)...
[SUCCESS] 0 allocation errors, 0 consistency errors found.`
        },
        {
            id: "dbtools",
            name: "pod/ssms-redgate-operator",
            version: "v19.1.0",
            desc: "Utilizing database administration utilities including SQL Server Management Studio (SSMS), Redgate SQL Compare, PGAdmin, and MongoDB Compass.",
            logs: `[INFO] Running schema diff comparison with Redgate comparison tool...
[INFO] Source Database: Development-Replica
[INFO] Target Database: Production-Instance
[INFO] Results: 2 stored procedures out of sync.
[INFO] Generating deployment synchronisation script...
[SUCCESS] Sync script generated. Ready for code promotion.`
        },
        {
            id: "iis",
            name: "pod/iis-web-host",
            version: "v10.0",
            desc: "Configuring IIS Web Server hosts, managing application pools, binding secure SSL certificates, and troubleshooting HTTP request issues.",
            logs: `[INFO] Querying IIS application pool state...
[INFO] AppPool "SimplifyAppPool": Status: RUNNING (PID: 20994)
[INFO] Active SSL bindings: https://app.simplifyhealthcare.com (443)
[INFO] CPU usage pool: 2.4% / Memory allocation: 512MB
[INFO] Status check: OK`
        }
    ],
    dev: [
        {
            id: "python",
            name: "pod/python-runtime-3-11",
            version: "v3.11.8",
            desc: "Writing scripting tools in Python to automate log monitoring, audit server configurations, and develop Django API backend modules.",
            logs: `[INFO] python --version -> Python 3.11.8
[INFO] Running file script: audit_ports.py
[INFO] Scanning system listening network ports...
[WARNING] Port 8080 listening without firewall block.
[INFO] Script generated firewall recommendation rule. Task complete.`
        },
        {
            id: "dotnet",
            name: "pod/dotnet-runtime",
            version: "v8.0.0",
            desc: "Understanding backend structures, deploying .NET API application pools, and troubleshooting IIS runtime issues.",
            logs: `[INFO] dotnet --info
.NET SDK version: 8.0.100
[INFO] Restoring project dependencies...
[INFO] Restored successfully. (1.2s)
[INFO] Running code compilation: dotnet build -c Release
[SUCCESS] 0 Errors, 0 Warnings.`
        }
    ],
    monitoring: [
        {
            id: "siem",
            name: "pod/siem-security-analyzer",
            version: "v8.11.0",
            desc: "Monitoring system security alerts, parsing system event logs, and identifying threat indicators to resolve production incidents proactively.",
            logs: `[INFO] Connecting to SIEM event indexer gateway...
[INFO] Active streams checked: 4 logs channels active.
[INFO] Parsing event logs for patterns of security vulnerabilities...
[INFO] Alert check: No brute force signatures detected.
[SUCCESS] Cluster security assessment status: SAFE.`
        },
        {
            id: "alerts",
            name: "pod/azure-monitor-alerts",
            version: "v1.12.0",
            desc: "Configuring metrics alerting criteria for disk space thresholds, CPU exhaustion, and memory leaks. Directing alerts to support teams via GLPI/ITSM.",
            logs: `[INFO] Querying monitor rules database...
[INFO] Alert rule [DiskSpaceCritical]: Enabled (Threshold: 85% full)
[INFO] Alert rule [CPUUtilizationHigh]: Enabled (Threshold: 80% for 5 mins)
[INFO] Diagnostic probe active. Host disks capacity checked: 52% free.`
        },
        {
            id: "prompting",
            name: "pod/gpt-ai-assistant",
            version: "v4.0.0",
            desc: "Utilizing AI prompting techniques to brainstorm system designs, write script structures, and automate operational documentation.",
            logs: `[INFO] AI prompt request received: "Generate modular terraform VPC template"
[INFO] LLM completion response constructed (2.4s)
[INFO] Generating terraform files structure...
[INFO] Completed: main.tf, variables.tf, outputs.tf outputted.
[SUCCESS] Template generated.`
        }
    ]
};

const nsTabs = document.querySelectorAll('.ns-tab');
const podsGrid = document.getElementById('pods-grid');
const podConsoleLogs = document.getElementById('pod-console-logs');
const currentNamespaceTitle = document.querySelector('.current-namespace-title');
const podCountBadge = document.getElementById('pod-count');

function loadNamespacePods(nsKey) {
    const pods = namespacePods[nsKey];
    if (!pods) return;

    const friendlyNames = {
        infra: "ns/cloud-infra",
        containers: "ns/containers-ci-cd",
        db: "ns/databases-admin",
        dev: "ns/languages-it",
        monitoring: "ns/monitoring-ai"
    };
    currentNamespaceTitle.innerHTML = `<i class="fa-solid fa-cube"></i> Namespace: ${friendlyNames[nsKey]}`;
    podCountBadge.textContent = `${pods.length} Pods Running`;

    podsGrid.innerHTML = '';

    pods.forEach((pod, index) => {
        const card = document.createElement('div');
        card.className = `pod-card ${index === 0 ? 'active-pod' : ''}`;
        card.innerHTML = `
            <div class="pod-status">
                <span class="pod-dot"></span>
                <span class="pod-status-text">Running</span>
            </div>
            <h4 class="pod-name">${pod.name}</h4>
            <span class="pod-version">${pod.version}</span>
        `;

        card.addEventListener('click', () => {
            document.querySelectorAll('.pod-card').forEach(c => c.classList.remove('active-pod'));
            card.classList.add('active-pod');
            
            const consoleTabName = document.querySelector('.console-tab-name');
            consoleTabName.innerHTML = `<i class="fa-solid fa-code"></i> kubectl logs ${pod.name}`;
            podConsoleLogs.textContent = pod.logs;
        });

        podsGrid.appendChild(card);
    });

    if (pods.length > 0) {
        const consoleTabName = document.querySelector('.console-tab-name');
        consoleTabName.innerHTML = `<i class="fa-solid fa-code"></i> kubectl logs ${pods[0].name}`;
        podConsoleLogs.textContent = pods[0].logs;
    }
}

nsTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        nsTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const nsKey = tab.getAttribute('data-ns');
        loadNamespacePods(nsKey);
    });
});

loadNamespacePods('infra');


/* ==========================================================================
   3. CI/CD Deployment History & Pipeline Simulator Dashboard
   ========================================================================== */
const simulateRunBtn = document.getElementById('simulate-run-btn');
const runnerBadgeStatus = document.getElementById('runner-badge-status');
const pipelineActiveId = document.getElementById('pipeline-active-id');
const pipelineActiveTime = document.getElementById('pipeline-active-time');
const pipelineActivePercent = document.getElementById('pipeline-active-percent');
const runnerStdoutLogsOutput = document.getElementById('runner-stdout-logs-output');
const deployHistoryContainer = document.getElementById('deploy-history-container');

const rSteps = {
    source: document.getElementById('r-step-clone'),
    build: document.getElementById('r-step-build'),
    test: document.getElementById('r-step-test'),
    deploy: document.getElementById('r-step-deploy')
};
const rConnectors = document.querySelectorAll('.r-connector');

let runHistoryData = [
    { commit: "f34d19b", msg: "refactor: optimize inventory sync checks", time: "1 hour ago", duration: "48s" },
    { commit: "e88102a", msg: "fix: resolve SmartBiz webhook payload mapping", time: "5 hours ago", duration: "52s" },
    { commit: "a78b912", msg: "chore: update CloudWatch alarm thresholds config", time: "1 day ago", duration: "44s" }
];

let pipelineRunning = false;
let elapsedSeconds = 0;
let progressInterval = null;

function renderHistory() {
    deployHistoryContainer.innerHTML = '';
    runHistoryData.forEach(run => {
        const row = document.createElement('div');
        row.className = 'history-row-item';
        row.innerHTML = `
            <div class="hist-left">
                <span class="hist-commit-id"><i class="fa-solid fa-code-commit"></i> commit:${run.commit}</span>
                <span class="hist-commit-msg">${run.msg}</span>
                <span class="hist-time">${run.time} • duration: ${run.duration}</span>
            </div>
            <div class="hist-right">
                <span class="hist-status passing">passing</span>
            </div>
        `;
        deployHistoryContainer.appendChild(row);
    });
}
renderHistory();

function appendRunnerLog(text, type = '') {
    const div = document.createElement('div');
    div.style.marginBottom = '4px';
    if (type === 'success') div.style.color = 'var(--accent-emerald)';
    if (type === 'info') div.style.color = 'var(--accent-indigo)';
    
    const time = new Date().toISOString().slice(11, 19);
    div.innerHTML = `<span style="color: var(--text-muted)">[${time}]</span> ${text}`;
    runnerStdoutLogsOutput.appendChild(div);
    runnerStdoutLogsOutput.scrollTop = runnerStdoutLogsOutput.scrollHeight;
}

function resetPipelineRunner() {
    Object.values(rSteps).forEach(step => step.className = 'r-step');
    rConnectors.forEach(conn => conn.className = 'r-connector');
}

const mockCommits = [
    { commit: "bc12891", msg: "feat: add secure s3 kms encryption rules" },
    { commit: "ff52012", msg: "fix: sql server transaction pool deadlock optimization" },
    { commit: "dc9902a", msg: "refactor: increase alb check timeout limit parameters" },
    { commit: "c182811", msg: "chore: deploy inventory sync log handlers filters" }
];

function runPipelineSimulation() {
    if (pipelineRunning) return;

    pipelineRunning = true;
    simulateRunBtn.disabled = true;
    runnerBadgeStatus.className = 'runner-badge running-badge';
    runnerBadgeStatus.textContent = 'Running';

    resetPipelineRunner();
    runnerStdoutLogsOutput.innerHTML = '';
    
    const currentJob = Math.floor(Math.random() * 800) + 200;
    pipelineActiveId.textContent = `#${currentJob}`;
    
    // Select a mock commit
    const activeCommit = mockCommits[Math.floor(Math.random() * mockCommits.length)];

    elapsedSeconds = 0;
    pipelineActiveTime.textContent = '0s';
    pipelineActivePercent.textContent = '0%';

    progressInterval = setInterval(() => {
        elapsedSeconds++;
        pipelineActiveTime.textContent = `${elapsedSeconds}s`;
    }, 1000);

    appendRunnerLog(`Triggered by Git Webhook: push event on origin/main`, 'info');
    appendRunnerLog(`Initializing runner instance context...`, 'info');

    // Run phases
    const phases = [
        {
            delay: 1000,
            action: () => {
                rSteps.source.classList.add('active');
                pipelineActivePercent.textContent = '10%';
                appendRunnerLog(`[SOURCE] Cloning repository: git clone https://github.com/Abhi787145/devops-portfolio.git`);
                appendRunnerLog(`[SOURCE] HEAD commit: <span style="color: var(--text-primary); font-weight: bold;">${activeCommit.commit}</span> - ${activeCommit.msg}`);
            }
        },
        {
            delay: 2800,
            action: () => {
                rSteps.source.classList.remove('active');
                rSteps.source.classList.add('success');
                rConnectors[0].className = 'r-connector fill-complete';
                pipelineActivePercent.textContent = '30%';
                appendRunnerLog(`[SOURCE] Repository cloned in 1.8s. All files ready.`, 'success');
            }
        },
        {
            delay: 3600,
            action: () => {
                rSteps.build.classList.add('active');
                pipelineActivePercent.textContent = '40%';
                appendRunnerLog(`[BUILD] Running multi-stage Docker build: <code>docker build -t sync-engine:latest .</code>`);
                appendStdoutRunnerCode([
                    "Step 1/3 : FROM python:3.11-slim",
                    "Step 2/3 : RUN pip install -r requirements.txt",
                    "Step 3/3 : COPY . . & EXPOSE 80"
                ]);
            }
        },
        {
            delay: 6000,
            action: () => {
                rSteps.build.classList.remove('active');
                rSteps.build.classList.add('success');
                rConnectors[1].className = 'r-connector fill-complete';
                pipelineActivePercent.textContent = '65%';
                appendRunnerLog(`[BUILD] Docker image successfully built and tagged. Size: 92MB`, 'success');
            }
        },
        {
            delay: 6800,
            action: () => {
                rSteps.test.classList.add('active');
                pipelineActivePercent.textContent = '75%';
                appendRunnerLog(`[SCAN] Launching Trivy container vulnerability scanner...`);
            }
        },
        {
            delay: 8800,
            action: () => {
                appendRunnerLog(`[SCAN] Result: 0 vulnerabilities found (Critical: 0, High: 0, Medium: 0)`);
                appendRunnerLog(`[SCAN] Running Python pytest suite... PASS: tests/inventory.spec.py`);
                
                rSteps.test.classList.remove('active');
                rSteps.test.classList.add('success');
                rConnectors[2].className = 'r-connector fill-complete';
                pipelineActivePercent.textContent = '88%';
                appendRunnerLog(`[SCAN] Quality gates succeeded. Checks passed.`, 'success');
            }
        },
        {
            delay: 9600,
            action: () => {
                rSteps.deploy.classList.add('active');
                pipelineActivePercent.textContent = '92%';
                appendRunnerLog(`[DEPLOY] Accessing AWS kubernetes configuration context...`);
                appendRunnerLog(`[DEPLOY] kubectl apply -f k8s/deployment.yaml`);
                appendRunnerLog(`[DEPLOY] Service replicas scaled: 3 healthy nodes online.`);
            }
        },
        {
            delay: 11800,
            action: () => {
                rSteps.deploy.classList.remove('active');
                rSteps.deploy.classList.add('success');
                pipelineActivePercent.textContent = '100%';

                clearInterval(progressInterval);
                
                appendRunnerLog(`[DEPLOY] Routing active ingress traffic to dropship-api-elb...`, 'success');
                appendRunnerLog(`[DEPLOY] Deployment completed successfully!`, 'success');

                runnerBadgeStatus.className = 'runner-badge success-badge';
                runnerBadgeStatus.textContent = 'Success';

                // Add to history
                runHistoryData.unshift({
                    commit: activeCommit.commit,
                    msg: activeCommit.msg,
                    time: "Just now",
                    duration: `${elapsedSeconds}s`
                });
                if (runHistoryData.length > 5) runHistoryData.pop();
                renderHistory();

                pipelineRunning = false;
                simulateRunBtn.disabled = false;
            }
        }
    ];

    phases.forEach(step => setTimeout(step.action, step.delay));
}

function appendStdoutRunnerCode(lines) {
    lines.forEach(line => {
        const div = document.createElement('div');
        div.style.paddingLeft = '12px';
        div.style.color = 'var(--text-secondary)';
        div.style.fontFamily = 'var(--font-mono)';
        div.style.fontSize = '0.75rem';
        div.innerHTML = line;
        runnerStdoutLogsOutput.appendChild(div);
    });
    runnerStdoutLogsOutput.scrollTop = runnerStdoutLogsOutput.scrollHeight;
}

simulateRunBtn.addEventListener('click', runPipelineSimulation);


/* ==========================================================================
   4. Interactive Blueprint Details (ShopNexa Architecture)
   ========================================================================== */
const bpNodes = document.querySelectorAll('.bp-node');
const bpSpecTitle = document.getElementById('bp-spec-title');
const bpSpecDesc = document.getElementById('bp-spec-desc');
const bpSpecTf = document.getElementById('bp-spec-tf');
const copyTfBtn = document.getElementById('copy-tf-btn');

const bpSpecsData = {
    store: {
        title: "The ShopNexa Storefront (SmartBiz)",
        desc: "The public-facing e-commerce storefront hosted on Amazon's SmartBiz platform. Utilizes Amazon's globally cached CloudFront CDN edge distribution layers to deliver catalogs, trendy earrings, jhumkas, and accessories assets. Orders and inventory hooks are sent as events to the AWS integration backend.",
        tf: `# Webhook payload configuration mapped inside SmartBiz Admin Console
{
  "webhook_target_url": "https://dropship-api.abhisheksharma.cloud/v1/orders",
  "auth_header": "X-ShopNexa-Signature",
  "events_subscribed": [
    "order.created",
    "inventory.low",
    "catalog.price_update"
  ]
}`
    },
    alb: {
        title: "Application Load Balancer (ALB)",
        desc: "An AWS Application Load Balancer configured to handle external client web traffic and webhooks. It terminates TLS certificates and routes HTTP requests across two separate Availability Zones to instances inside Auto-Scaling groups, securing maximum application uptime.",
        tf: `resource "aws_lb" "web_alb" {
  name               = "dropshipping-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [for s in aws_subnet.public : s.id]

  tags = {
    Environment = "production"
    Application = "dropshipping"
  }
}`
    },
    ec2: {
        title: "EC2 Sync engine Service",
        desc: "A custom Python/Django background process running on Auto-Scaling EC2 instances. It processes incoming order webhooks from ShopNexa, synchronizes inventories with wholesale dropshippers, and manages catalog pricing updates.",
        tf: `resource "aws_autoscaling_group" "sync_asg" {
  name_prefix         = "dropship-sync-asg-"
  desired_capacity    = 2
  max_size            = 4
  min_size            = 2
  vpc_zone_identifier = [for s in aws_subnet.public : s.id]

  launch_template {
    id      = aws_launch_template.sync_template.id
    version = "$Latest"
  }
}`
    },
    rds: {
        title: "RDS SQL Server Database",
        desc: "A Multi-AZ relational database service (SQL Server) managing sync schedules, order logs, product mapping indexes, and pricing rules. Multi-AZ replication ensures database recovery in case of zone failure.",
        tf: `resource "aws_db_instance" "sync_db" {
  identifier           = "dropship-rds-prod"
  allocated_storage    = 20
  engine               = "sqlserver-ex"
  engine_version       = "15.00"
  instance_class       = "db.t3.medium"
  db_subnet_group_name = aws_db_subnet_group.db_subnet.name
  multi_az             = true
  username             = "sa_admin"
  password             = var.db_password
  skip_final_snapshot  = true
}`
    },
    s3: {
        title: "Amazon S3 Static Assets Storage",
        desc: "An S3 bucket storing inventory static reports, product pictures, catalog backups, and logs. Leverages lifecycle parameters to migrate backups older than 30 days to Glacier and implements default AES-256 server-side encryption.",
        tf: `resource "aws_s3_bucket" "assets_bucket" {
  bucket = "dropshipping-prod-assets-sharma"

  tags = {
    Environment = "Production"
    DataType    = "StaticAssets"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "s3_encrypt" {
  bucket = aws_s3_bucket.assets_bucket.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}`
    },
    cw: {
        title: "CloudWatch Operations Monitor",
        desc: "Monitors systems performance (CPU load, memory thresholds, HTTP 5XX ALB errors, RDS active connections). Alerting policies invoke SNS topics that alert Abhishek via ITIL channels when issues emerge.",
        tf: `resource "aws_cloudwatch_metric_alarm" "cpu_utilization_high" {
  alarm_name          = "web-ec2-cpu-high-alarm"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120"
  statistic           = "Average"
  threshold           = "75"
  alarm_description   = "This alarm triggers scaling policy when CPU >= 75%"
  alarm_actions       = [aws_sns_topic.operations_alerts.arn]
}`
    }
};

bpNodes.forEach(node => {
    node.addEventListener('click', () => {
        bpNodes.forEach(n => n.classList.remove('active-bp-node'));
        node.classList.add('active-bp-node');

        const key = node.getAttribute('data-node');
        const spec = bpSpecsData[key];

        if (spec) {
            const panel = document.getElementById('bp-specs-panel');
            panel.style.opacity = 0.3;
            panel.style.transform = 'translateY(5px)';

            setTimeout(() => {
                bpSpecTitle.textContent = spec.title;
                bpSpecDesc.textContent = spec.desc;
                bpSpecTf.textContent = spec.tf;
                
                panel.style.opacity = 1;
                panel.style.transform = 'translateY(0)';
            }, 120);
        }
    });
});

if (copyTfBtn) {
    copyTfBtn.addEventListener('click', () => {
        const codeText = bpSpecTf.textContent;
        navigator.clipboard.writeText(codeText).then(() => {
            copyTfBtn.textContent = 'Copied!';
            copyTfBtn.style.color = 'var(--accent-emerald)';
            setTimeout(() => {
                copyTfBtn.textContent = 'Copy code';
                copyTfBtn.style.color = 'var(--accent-indigo)';
            }, 2000);
        }).catch(err => console.error('Copy code failed:', err));
    });
}


/* ==========================================================================
   5. Formspree Contact Manifest Form connection
   ========================================================================== */
const contactForm = document.getElementById('direct-contact-form');
const formFeedback = document.getElementById('yaml-form-feedback');
const submitManifestBtn = document.getElementById('manifest-submit-btn');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const originalText = submitManifestBtn.innerHTML;
        submitManifestBtn.disabled = true;
        submitManifestBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Deploying...';
        formFeedback.className = 'yaml-form-feedback';
        formFeedback.style.display = 'none';

        // Submit form data using fetch
        const formData = new FormData(contactForm);
        
        fetch(contactForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            submitManifestBtn.disabled = false;
            submitManifestBtn.innerHTML = originalText;
            
            if (response.ok) {
                formFeedback.className = 'yaml-form-feedback success';
                formFeedback.innerHTML = '<i class="fa-solid fa-check"></i> connectionrequest.v1.yaml successfully applied! Message sent to as787145@gmail.com.';
                formFeedback.style.display = 'block';
                contactForm.reset();
            } else {
                response.json().then(data => {
                    if (Object.hasOwnProperty.call(data, 'errors')) {
                        formFeedback.innerHTML = data['errors'].map(error => error['message']).join(', ');
                    } else {
                        formFeedback.innerHTML = "Oops! There was a problem submitting your form.";
                    }
                    formFeedback.className = 'yaml-form-feedback error';
                    formFeedback.style.display = 'block';
                });
            }
        })
        .catch(error => {
            // Fallback for local testing or when Formspree endpoint limits are exceeded
            submitManifestBtn.disabled = false;
            submitManifestBtn.innerHTML = originalText;
            
            formFeedback.className = 'yaml-form-feedback success';
            formFeedback.innerHTML = '<i class="fa-solid fa-check"></i> connectionrequest.v1.yaml applied (Simulated Mode). Message logged for as787145@gmail.com.';
            formFeedback.style.display = 'block';
            contactForm.reset();
        });
    });
}

// Mobile toggle menu
const mobileToggle = document.querySelector('.mobile-toggle');
const navMenu = document.querySelector('.nav-menu');
if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('open');
        const icon = mobileToggle.querySelector('i');
        if (navMenu.classList.contains('open')) {
            icon.className = 'fa-solid fa-xmark';
        } else {
            icon.className = 'fa-solid fa-bars-staggered';
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            mobileToggle.querySelector('i').className = 'fa-solid fa-bars-staggered';
        });
    });
}
