import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Ball {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
}

// 1. High-Fidelity SVG Strings for the 8 tools from the resume
const awsSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="256" height="256">
  <rect width="100" height="100" fill="none"/>
  <text x="50" y="45" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="28" fill="#FFFFFF" text-anchor="middle">aws</text>
  <path d="M 22 55 Q 50 78 78 55" fill="none" stroke="#FF9900" stroke-width="6" stroke-linecap="round"/>
  <path d="M 74 48 L 81 56 L 70 61" fill="none" stroke="#FF9900" stroke-width="5" stroke-linecap="round"/>
</svg>
`;

const azureSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="256" height="256">
  <rect width="100" height="100" fill="none"/>
  <path d="M 15 75 L 50 18 L 81 48 L 105 85 H 68 L 50 56 L 33 85 H 15 Z" fill="#0078D4"/>
  <path d="M 105 85 L 81 48 L 68 68 L 86 85 H 105 Z" fill="#50E6FF"/>
</svg>
`;

const k8sSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="256" height="256">
  <rect width="100" height="100" fill="none"/>
  <path d="M 50 8 L 88 30 V 74 L 50 96 L 12 74 V 30 Z" fill="#326CE5"/>
  <circle cx="50" cy="52" r="14" fill="#326CE5" stroke="#FFFFFF" stroke-width="5"/>
  <path d="M 50 20 V 38 M 50 84 V 66 M 22 36 L 38 45 M 78 68 L 62 59 M 22 68 L 38 59 M 78 36 L 62 45" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>
</svg>
`;

const dockerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="256" height="256">
  <rect width="100" height="100" fill="none"/>
  <path d="M 15 65 C 15 80, 55 80, 75 75 C 90 70, 98 56, 98 48 C 98 44, 90 44, 85 48 C 80 52, 72 55, 62 55 C 52 55, 38 50, 28 53 C 20 56, 17 61, 15 65 Z" fill="#2496ED"/>
  <path d="M 85 48 C 88 38, 95 38, 98 44" fill="none" stroke="#2496ED" stroke-width="4" stroke-linecap="round"/>
  <rect x="35" y="44" width="8" height="8" fill="#50E6FF" rx="1"/>
  <rect x="45" y="44" width="8" height="8" fill="#50E6FF" rx="1"/>
  <rect x="55" y="44" width="8" height="8" fill="#50E6FF" rx="1"/>
  <rect x="65" y="44" width="8" height="8" fill="#50E6FF" rx="1"/>
  <rect x="40" y="34" width="8" height="8" fill="#50E6FF" rx="1"/>
  <rect x="50" y="34" width="8" height="8" fill="#50E6FF" rx="1"/>
  <rect x="60" y="34" width="8" height="8" fill="#50E6FF" rx="1"/>
  <rect x="45" y="24" width="8" height="8" fill="#50E6FF" rx="1"/>
  <rect x="55" y="24" width="8" height="8" fill="#50E6FF" rx="1"/>
</svg>
`;

const terraformSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="256" height="256">
  <rect width="100" height="100" fill="none"/>
  <g transform="translate(14, 14) scale(0.95)">
    <path d="M 0 0 L 34 20 L 34 60 L 0 40 Z" fill="#5C4EE5"/>
    <path d="M 38 22 L 72 2 L 72 42 L 38 62 Z" fill="#5C4EE5"/>
    <path d="M 0 44 L 34 64 L 34 104 L 0 84 Z" fill="#5C4EE5"/>
    <path d="M 38 66 L 72 46 L 72 86 L 38 106 Z" fill="#844FBA"/>
  </g>
</svg>
`;

const sqlServerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="256" height="256">
  <rect width="100" height="100" fill="none"/>
  <path d="M 50 15 C 75 15, 90 22, 90 30 C 90 38, 75 45, 50 45 C 25 45, 10 38, 10 30 C 10 22, 25 15, 50 15 Z" fill="#E23528"/>
  <path d="M 90 30 V 52 C 90 60, 75 67, 50 67 C 25 67, 10 60, 10 52 V 30 C 10 38, 25 45, 50 45 C 75 45, 90 38, 90 30 Z" fill="#CC292B"/>
  <path d="M 90 52 V 74 C 90 82, 75 89, 50 89 C 25 89, 10 82, 10 74 V 52 C 10 60, 25 67, 50 67 C 75 67, 90 60, 90 52 Z" fill="#A82023"/>
</svg>
`;

const pythonSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="256" height="256">
  <rect width="100" height="100" fill="none"/>
  <path d="M 50 6 C 25.7 6, 26.3 16.5, 26.3 16.5 L 26.3 31 H 50 V 34.2 H 16.3 C 16.3 34.2, 6 35.8, 6 54.8 C 6 73.8, 19.8 74.4, 19.8 74.4 H 29.7 V 62 C 29.7 48.6, 40.5 48.6, 40.5 48.6 H 70.3 C 70.3 48.6, 80.2 47.7, 80.2 31 C 80.2 14.3, 70.3 6, 50 6 Z" fill="#306998"/>
  <path d="M 50 94 C 74.3 94, 73.7 83.5, 73.7 83.5 L 73.7 69 H 50 V 65.8 H 83.7 C 83.7 65.8, 94 64.2, 94 45.2 C 94 26.2, 80.2 25.6, 80.2 25.6 H 70.3 V 38 C 70.3 51.4, 59.5 51.4, 59.5 51.4 H 29.7 C 29.7 51.4, 19.8 52.3, 19.8 69 C 19.8 85.7, 29.7 94, 50 94 Z" fill="#FFD43B"/>
  <circle cx="36.5" cy="18" r="3.5" fill="#FFFFFF"/>
  <circle cx="63.5" cy="82" r="3.5" fill="#FFFFFF"/>
</svg>
`;

const jenkinsSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="256" height="256">
  <rect width="100" height="100" fill="none"/>
  <path d="M 50 25 C 33 25, 33 42, 33 42 C 33 42, 38 48, 50 48 C 62 48, 67 42, 67 42 C 67 42, 67 25, 50 25 Z" fill="#F1F1F1" />
  <path d="M 28 28 C 28 18, 38 15, 50 15 C 62 15, 72 18, 72 28 C 66 28, 66 25, 50 25 C 34 25, 34 28, 28 28 Z" fill="#2D2D2D" />
  <path d="M 38 20 C 38 15, 42 10, 50 10 C 58 10, 62 15, 62 20 Z" fill="#2D2D2D" />
  <path d="M 38 48 L 62 48 L 68 85 L 32 85 Z" fill="#1F4068" />
  <path d="M 50 48 L 43 58 L 57 58 Z" fill="#D24939" />
  <circle cx="45" cy="34" r="2.5" fill="#2D2D2D" />
  <circle cx="55" cy="34" r="2.5" fill="#2D2D2D" />
</svg>
`;

const ansibleSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="256" height="256">
  <rect width="100" height="100" fill="none"/>
  <circle cx="50" cy="50" r="42" fill="#000000" stroke="#EE0000" stroke-width="4"/>
  <path d="M 50 18 L 18 78 H 32 L 50 44 L 68 78 H 82 L 50 18 Z M 50 34 L 59 52 H 41 L 50 34 Z" fill="#FFFFFF"/>
</svg>
`;

const skillsList = [
  { name: 'AWS', svg: awsSvg, bg: '#10172A' },
  { name: 'Azure', svg: azureSvg, bg: '#0A1224' },
  { name: 'Kubernetes', svg: k8sSvg, bg: '#0A1B39' },
  { name: 'Docker', svg: dockerSvg, bg: '#051E39' },
  { name: 'Terraform', svg: terraformSvg, bg: '#0D091F' },
  { name: 'SQL Server', svg: sqlServerSvg, bg: '#1C0D0D' },
  { name: 'Python', svg: pythonSvg, bg: '#081726' },
  { name: 'Jenkins', svg: jenkinsSvg, bg: '#0A0A10' },
  { name: 'Ansible', svg: ansibleSvg, bg: '#000000' }
];

// Helper to convert SVG to CanvasTexture
const loadSvgTexture = (svgMarkup: string, colorBg: string): Promise<THREE.Texture> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas context unavailable'));
      return;
    }

    const img = new Image();
    img.onload = () => {
      // Draw background
      ctx.fillStyle = colorBg;
      ctx.fillRect(0, 0, 256, 256);
      
      // Draw border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, 256, 256);

      // Draw SVG in center
      ctx.drawImage(img, 32, 32, 192, 192);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      resolve(texture);
    };
    img.onerror = (e) => {
      reject(e);
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgMarkup)));
  });
};

const TechBalls = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width || 350;
    const height = rect.height || 220;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(0, 6, 6);
    scene.add(dirLight);

    // Bounding limits
    const limitX = 4.5;
    const limitY = 2.8;
    const limitZ = 2.0;
    const ballRadius = 0.65; // Bigger size as requested

    const balls: Ball[] = [];
    const sphereGeo = new THREE.SphereGeometry(ballRadius, 32, 32);

    // Mouse coordinates
    let mouse = { x: 0, y: 0, active: false };

    const onMouseMove = (e: MouseEvent) => {
      const containerRect = container.getBoundingClientRect();
      const clientX = e.clientX - containerRect.left;
      const clientY = e.clientY - containerRect.top;
      
      mouse.x = (clientX / containerRect.width) * 2 - 1;
      mouse.y = -(clientY / containerRect.height) * 2 + 1;
      mouse.active = true;
    };

    const onMouseLeave = () => {
      mouse.active = false;
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);

    // Load textures and assemble spheres
    Promise.all(skillsList.map(skill => loadSvgTexture(skill.svg, skill.bg)))
      .then((textures) => {
        textures.forEach((texture, idx) => {
          // Premium physical glass material with emissive maps
          const material = new THREE.MeshPhysicalMaterial({
            map: texture,
            roughness: 0.12,
            metalness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            transmission: 0.35, // Semitransparent glass look
            thickness: 0.5,
            ior: 1.5,
            emissive: '#ffffff',
            emissiveMap: texture,
            emissiveIntensity: 0.2
          });

          const mesh = new THREE.Mesh(sphereGeo, material);
          
          // Random positions inside limits
          mesh.position.set(
            (Math.random() - 0.5) * (limitX * 1.2),
            (Math.random() - 0.5) * (limitY * 1.2),
            (Math.random() - 0.5) * (limitZ * 1.2)
          );
          
          scene.add(mesh);

          balls.push({
            mesh,
            vx: (Math.random() - 0.5) * 0.04,
            vy: (Math.random() - 0.5) * 0.04,
            vz: (Math.random() - 0.5) * 0.02,
            radius: ballRadius
          });
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed loading SVG textures, loading backup materials", err);
        // Fallback implementation
        for (let i = 0; i < 8; i++) {
          const material = new THREE.MeshPhysicalMaterial({ color: 0x06b6d4, roughness: 0.2 });
          const mesh = new THREE.Mesh(sphereGeo, material);
          mesh.position.set((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 1.5, 0);
          scene.add(mesh);
          balls.push({
            mesh,
            vx: (Math.random() - 0.5) * 0.03,
            vy: (Math.random() - 0.5) * 0.03,
            vz: 0,
            radius: ballRadius
          });
        }
        setLoading(false);
      });

    // Animation Loop
    let animFrameId: number;
    const tick = () => {
      animFrameId = requestAnimationFrame(tick);

      // 1. Friction drag and movement update
      balls.forEach((ball) => {
        // Friction damping
        ball.vx *= 0.985;
        ball.vy *= 0.985;
        ball.vz *= 0.97;

        // Cursor Repulsion Physics (Bouncing off cursor)
        if (mouse.active) {
          const targetX = mouse.x * limitX;
          const targetY = mouse.y * limitY;
          const targetZ = 0;

          const dx = ball.mesh.position.x - targetX;
          const dy = ball.mesh.position.y - targetY;
          const dz = ball.mesh.position.z - targetZ;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const mouseRadius = 1.8; // Virtual cursor radius

          if (dist < mouseRadius + ball.radius) {
            const overlap = (mouseRadius + ball.radius) - dist;
            const nx = dx / (dist || 0.01);
            const ny = dy / (dist || 0.01);
            const nz = dz / (dist || 0.01);

            // Push the ball out of cursor boundary
            ball.mesh.position.x += nx * overlap;
            ball.mesh.position.y += ny * overlap;
            ball.mesh.position.z += nz * overlap;

            // Give a bounce kick velocity away from the cursor
            ball.vx = nx * 0.05 + (Math.random() - 0.5) * 0.01;
            ball.vy = ny * 0.05 + (Math.random() - 0.5) * 0.01;
            ball.vz = nz * 0.03;
          }
        }

        // Mild gravity back to center to avoid drifting offscreen
        ball.vx -= ball.mesh.position.x * 0.0006;
        ball.vy -= ball.mesh.position.y * 0.0006;
        ball.vz -= ball.mesh.position.z * 0.0006;

        // Apply velocities
        ball.mesh.position.x += ball.vx;
        ball.mesh.position.y += ball.vy;
        ball.mesh.position.z += ball.vz;

        // Wall boundary checks
        const boundaryX = limitX - ball.radius;
        const boundaryY = limitY - ball.radius;
        const boundaryZ = limitZ - ball.radius;

        if (ball.mesh.position.x > boundaryX) {
          ball.mesh.position.x = boundaryX;
          ball.vx *= -0.8;
        } else if (ball.mesh.position.x < -boundaryX) {
          ball.mesh.position.x = -boundaryX;
          ball.vx *= -0.8;
        }

        if (ball.mesh.position.y > boundaryY) {
          ball.mesh.position.y = boundaryY;
          ball.vy *= -0.8;
        } else if (ball.mesh.position.y < -boundaryY) {
          ball.mesh.position.y = -boundaryY;
          ball.vy *= -0.8;
        }

        if (ball.mesh.position.z > boundaryZ) {
          ball.mesh.position.z = boundaryZ;
          ball.vz *= -0.8;
        } else if (ball.mesh.position.z < -boundaryZ) {
          ball.mesh.position.z = -boundaryZ;
          ball.vz *= -0.8;
        }

        // Constant slow spin rotation
        ball.mesh.rotation.x += 0.006;
        ball.mesh.rotation.y += 0.008;
      });

      // 2. Handle Sphere-to-Sphere collisions
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const b1 = balls[i];
          const b2 = balls[j];

          const dx = b2.mesh.position.x - b1.mesh.position.x;
          const dy = b2.mesh.position.y - b1.mesh.position.y;
          const dz = b2.mesh.position.z - b1.mesh.position.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const minDist = b1.radius + b2.radius;

          if (dist < minDist) {
            // Overlap correction
            const overlap = minDist - dist;
            const nx = dx / (dist || 0.01);
            const ny = dy / (dist || 0.01);
            const nz = dz / (dist || 0.01);

            b1.mesh.position.x -= nx * overlap * 0.5;
            b1.mesh.position.y -= ny * overlap * 0.5;
            b1.mesh.position.z -= nz * overlap * 0.5;

            b2.mesh.position.x += nx * overlap * 0.5;
            b2.mesh.position.y += ny * overlap * 0.5;
            b2.mesh.position.z += nz * overlap * 0.5;

            // Elastic velocity resolution
            const kx = b1.vx - b2.vx;
            const ky = b1.vy - b2.vy;
            const kz = b1.vz - b2.vz;
            const impulse = (kx * nx + ky * ny + kz * nz);

            if (impulse > 0) {
              b1.vx -= nx * impulse * 0.8;
              b1.vy -= ny * impulse * 0.8;
              b1.vz -= nz * impulse * 0.8;

              b2.vx += nx * impulse * 0.8;
              b2.vy += ny * impulse * 0.8;
              b2.vz += nz * impulse * 0.8;
            }
          }
        }
      }

      renderer.render(scene, camera);
    };

    tick();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newRect = container.getBoundingClientRect();
      const w = newRect.width;
      const h = newRect.height;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animFrameId);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', handleResize);
      scene.clear();
      renderer.dispose();
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {loading && (
        <div className="operator-loading-overlay">
          <span className="operator-pulse-dot"></span>
          <span>Loading node replicas...</span>
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default TechBalls;
