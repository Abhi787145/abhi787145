import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Ball {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
}

const TechBalls = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width || 350;
    const height = rect.height || 180;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(0, 5, 5);
    scene.add(dirLight);

    // 3. Texture Loader & Image List
    const textureLoader = new THREE.TextureLoader();
    const basePath = import.meta.env.BASE_URL || '/';
    const imageUrls = [
      'react2.webp',
      'next2.webp',
      'node2.webp',
      'express.webp',
      'mongo.webp',
      'mysql.webp',
      'typescript.webp',
      'javascript.webp'
    ].map(name => `${basePath}images/${name}`);

    // Boundary Limits
    const limitX = 3.8;
    const limitY = 1.8;
    const limitZ = 1.5;

    const balls: Ball[] = [];
    const sphereGeo = new THREE.SphereGeometry(0.42, 32, 32);

    // Mouse positions for hover attraction
    let mouse = { x: 0, y: 0, active: false };

    const onMouseMove = (e: MouseEvent) => {
      const containerRect = container.getBoundingClientRect();
      const clientX = e.clientX - containerRect.left;
      const clientY = e.clientY - containerRect.top;
      
      // Normalized coordinates
      mouse.x = (clientX / containerRect.width) * 2 - 1;
      mouse.y = -(clientY / containerRect.height) * 2 + 1;
      mouse.active = true;
    };

    const onMouseLeave = () => {
      mouse.active = false;
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);

    // Load textures and create physics meshes
    let loadedCount = 0;
    imageUrls.forEach((url) => {
      textureLoader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          
          // Material resembling the reference physical material with emissive glows
          const material = new THREE.MeshPhysicalMaterial({
            map: texture,
            emissive: '#ffffff',
            emissiveMap: texture,
            emissiveIntensity: 0.25,
            metalness: 0.2,
            roughness: 0.8,
            clearcoat: 0.1
          });

          const mesh = new THREE.Mesh(sphereGeo, material);
          
          // Random initial positions and velocities
          mesh.position.set(
            (Math.random() - 0.5) * (limitX * 1.5),
            (Math.random() - 0.5) * (limitY * 1.5),
            (Math.random() - 0.5) * (limitZ * 1.5)
          );
          
          scene.add(mesh);

          balls.push({
            mesh,
            vx: (Math.random() - 0.5) * 0.04,
            vy: (Math.random() - 0.5) * 0.04,
            vz: (Math.random() - 0.5) * 0.02,
            radius: 0.42
          });

          loadedCount++;
          if (loadedCount === imageUrls.length) {
            setLoading(false);
          }
        },
        undefined,
        (err) => {
          console.error("Failed loading texture:", url, err);
          // Fallback solid color sphere
          const material = new THREE.MeshPhysicalMaterial({ color: 0x8b5cf6 });
          const mesh = new THREE.Mesh(sphereGeo, material);
          mesh.position.set((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 1.5, 0);
          scene.add(mesh);
          balls.push({
            mesh,
            vx: (Math.random() - 0.5) * 0.03,
            vy: (Math.random() - 0.5) * 0.03,
            vz: 0,
            radius: 0.42
          });
          loadedCount++;
          if (loadedCount === imageUrls.length) {
            setLoading(false);
          }
        }
      );
    });

    // Physics Update and Animation Loop
    let animFrameId: number;
    const tick = () => {
      animFrameId = requestAnimationFrame(tick);

      // 1. Update individual positions, wall bounces & drag
      balls.forEach((ball) => {
        // Drag damping (friction)
        ball.vx *= 0.99;
        ball.vy *= 0.99;
        ball.vz *= 0.98;

        // Apply mouse attraction force if mouse is active
        if (mouse.active) {
          const targetX = mouse.x * limitX;
          const targetY = mouse.y * limitY;
          const dx = targetX - ball.mesh.position.x;
          const dy = targetY - ball.mesh.position.y;
          
          // Add acceleration towards mouse
          ball.vx += dx * 0.005;
          ball.vy += dy * 0.005;
        } else {
          // Micro-gravity pulls back to center (0,0) to keep balls in view
          ball.vx -= ball.mesh.position.x * 0.001;
          ball.vy -= ball.mesh.position.y * 0.001;
          ball.vz -= ball.mesh.position.z * 0.001;
        }

        // Apply velocities
        ball.mesh.position.x += ball.vx;
        ball.mesh.position.y += ball.vy;
        ball.mesh.position.z += ball.vz;

        // Bounce boundaries
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

        // Add subtle constant rotation
        ball.mesh.rotation.x += 0.008;
        ball.mesh.rotation.y += 0.01;
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
            // Collision detected! Push apart along normal to prevent overlapping
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

            // Elastic bounce reflection equations
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
