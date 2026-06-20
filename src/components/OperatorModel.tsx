import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader, DRACOLoader, RGBELoader } from 'three-stdlib';

// Bone lists for animation filtering
const typingBoneNames = [
  "thighL", "thighR", "shinL", "shinR", "forearmL", "forearmR",
  "handL", "handR", "f_pinky03R", "f_pinky02L", "f_pinky02R",
  "f_pinky01L", "f_pinky01R", "palm04L", "palm04R", "f_ring01L",
  "thumb01L", "thumb01R", "thumb03L", "thumb03R", "palm02L",
  "palm02R", "palm01L", "palm01R", "f_index01L", "f_index01R",
  "palm03L", "palm03R", "f_ring02L", "f_ring02R", "f_ring01R",
  "f_ring03L", "f_ring03R", "f_middle01L", "f_middle02L", "f_middle03L",
  "f_middle01R", "f_middle02R", "f_middle03R", "f_index02L", "f_index03L",
  "f_index02R", "f_index03R", "thumb02L", "f_pinky03L", "upper_armL",
  "upper_armR", "thumb02R", "toeL", "heel02L", "toeR", "heel02R",
];

// Helper to decrypt character asset in client browser
async function generateAESKey(password: string): Promise<CryptoKey> {
  const passwordBuffer = new TextEncoder().encode(password);
  const hashedPassword = await crypto.subtle.digest("SHA-256", passwordBuffer);
  return crypto.subtle.importKey(
    "raw",
    hashedPassword.slice(0, 32),
    { name: "AES-CBC" },
    false,
    ["encrypt", "decrypt"]
  );
}

const decryptFile = async (url: string, password: string): Promise<ArrayBuffer> => {
  const response = await fetch(url);
  const encryptedData = await response.arrayBuffer();
  const iv = new Uint8Array(encryptedData.slice(0, 16));
  const data = encryptedData.slice(16);
  const key = await generateAESKey(password);
  return crypto.subtle.decrypt({ name: "AES-CBC", iv }, key, data);
};

const OperatorModel = () => {
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    let rect = container.getBoundingClientRect();
    const width = rect.width || 300;
    const height = rect.height || 350;
    
    // Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(14.5, width / height, 0.1, 1000);
    camera.position.set(0, 12.8, 22.5); // Focus target position
    camera.zoom = 1.0;
    camera.updateProjectionMatrix();

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Directional Cyan Theme Lighting
    const dirLight = new THREE.DirectionalLight(0x06b6d4, 1.2);
    dirLight.position.set(-1, 5, 2);
    scene.add(dirLight);

    // Spot Light Purple Highlights
    const spotLight = new THREE.SpotLight(0x8b5cf6, 4, 30, 0.5, 1, 2);
    spotLight.position.set(2, 8, 4);
    scene.add(spotLight);

    // Load Environment Map
    new RGBELoader()
      .setPath(import.meta.env.BASE_URL + "models/")
      .load("char_enviorment.hdr", (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        scene.environmentIntensity = 0.7;
      });

    // GLTF / Draco Loader
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(import.meta.env.BASE_URL + "draco/");
    loader.setDRACOLoader(dracoLoader);

    let mixer: THREE.AnimationMixer | null = null;
    let headBone: THREE.Object3D | null = null;
    let characterObj: THREE.Object3D | null = null;
    let clock = new THREE.Clock();

    // Mouse Tracking Coordinates
    let mouse = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      // Convert to normalized device coordinates (-1 to +1)
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Load and Decrypt GLTF
    const loadModel = async () => {
      try {
        const decryptedBuffer = await decryptFile(
          import.meta.env.BASE_URL + "models/character.enc?v=2",
          "MyCharacter12"
        );
        const blobUrl = URL.createObjectURL(new Blob([decryptedBuffer]));

        loader.load(
          blobUrl,
          (gltf) => {
            characterObj = gltf.scene;
            
            // Adjust materials to cyan/purple design
            characterObj.traverse((child: any) => {
              if (child.name === "Plane004" || child.name === "screenlight") {
                child.visible = false;
              }
              if (child.isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                
                // Color shirt to theme-accent purple and pants to black
                if (mesh.material && mesh.name === "BODY.SHIRT") {
                  const shirtMat = (mesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
                  shirtMat.color = new THREE.Color("#8b5cf6"); // Purple Shirt
                  mesh.material = shirtMat;
                } else if (mesh.material && mesh.name === "Pant") {
                  const pantMat = (mesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
                  pantMat.color = new THREE.Color("#050811"); // Dark/Black Pants
                  mesh.material = pantMat;
                }
              }
            });

            // Adjust foot positioning
            const footR = characterObj.getObjectByName("footR");
            const footL = characterObj.getObjectByName("footL");
            if (footR) footR.position.y = 3.36;
            if (footL) footL.position.y = 3.36;

            scene.add(characterObj);
            headBone = characterObj.getObjectByName("spine006") || null;

            // Setup animations
            mixer = new THREE.AnimationMixer(characterObj);
            
            // 1. Play Intro Animation once
            const introClip = gltf.animations.find((c) => c.name === "introAnimation");
            if (introClip) {
              const introAction = mixer.clipAction(introClip);
              introAction.setLoop(THREE.LoopOnce, 1);
              introAction.clampWhenFinished = true;
              introAction.play();
            }

            // 2. Play base keyboard key typing loops
            const keyClips = ["key1", "key2", "key5", "key6"];
            keyClips.forEach((name) => {
              const clip = THREE.AnimationClip.findByName(gltf.animations, name);
              if (clip) {
                const action = mixer?.clipAction(clip);
                action.play();
                action.timeScale = 1.0;
              }
            });

            // 3. Play filtered typing bones action
            const typingClip = gltf.animations.find((c) => c.name === "typing");
            if (typingClip) {
              const filteredTracks = typingClip.tracks.filter((t) =>
                typingBoneNames.some((bName) => t.name.includes(bName))
              );
              const filteredClip = new THREE.AnimationClip(
                "typing_filtered",
                typingClip.duration,
                filteredTracks
              );
              const typingAction = mixer.clipAction(filteredClip);
              typingAction.enabled = true;
              typingAction.play();
              typingAction.timeScale = 1.0;
            }

            // 4. Play Blink action
            const blinkClip = gltf.animations.find((c) => c.name === "Blink");
            if (blinkClip) {
              mixer.clipAction(blinkClip).play();
            }

            setLoading(false);
            URL.revokeObjectURL(blobUrl);
            dracoLoader.dispose();
          },
          undefined,
          (err) => {
            console.error("Error loading GLTF model:", err);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Failed model decryption or loading:", err);
        setLoading(false);
      }
    };

    loadModel();

    // Render loop
    let animFrameId: number;
    const tick = () => {
      animFrameId = requestAnimationFrame(tick);
      
      // Update mixer time delta
      const delta = clock.getDelta();
      if (mixer) {
        mixer.update(delta);
      }

      // Rotate head bone to look at mouse position
      if (headBone) {
        const maxRotationY = Math.PI / 8;
        const maxRotationX = Math.PI / 10;
        
        // Lerp rotation values for smooth following
        headBone.rotation.y = THREE.MathUtils.lerp(headBone.rotation.y, mouse.x * maxRotationY, 0.08);
        headBone.rotation.x = THREE.MathUtils.lerp(headBone.rotation.x, -mouse.y * maxRotationX - 0.25, 0.08);
      }

      renderer.render(scene, camera);
    };

    tick();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      let newRect = container.getBoundingClientRect();
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
      window.removeEventListener('mousemove', onMouseMove);
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
          <span>Loading Operator Bio Link...</span>
        </div>
      )}
      <div ref={canvasContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default OperatorModel;
