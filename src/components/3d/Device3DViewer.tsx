import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Layers, RotateCw } from 'lucide-react';

interface Device3DViewerProps {
  currentScreenIndex?: number;
  onScreenChange?: (index: number) => void;
  scrollProgress?: number;
}

export const DESIGN_SCREENS = [
  {
    id: 0,
    title: 'NeuraAI Studio',
    subtitle: 'Generative AI Canvas & Telemetry UI',
    color: '#06b6d4',
    bgGradient: ['#0f172a', '#1e1b4b'],
    tag: 'SaaS Platform'
  },
  {
    id: 1,
    title: 'Veloce Mobility',
    subtitle: 'EV Supercar Companion & Telemetry HUD',
    color: '#10b981',
    bgGradient: ['#022c22', '#064e3b'],
    tag: 'Mobile App'
  },
  {
    id: 2,
    title: 'Krypton Pay',
    subtitle: 'Cross-Border DeFi Yield Vault',
    color: '#a855f7',
    bgGradient: ['#3b0764', '#1e1b4b'],
    tag: 'Fintech Protocol'
  },
  {
    id: 3,
    title: 'Aura Health',
    subtitle: 'Mindful Biometric OS & Watch App',
    color: '#f97316',
    bgGradient: ['#451a03', '#1c1917'],
    tag: 'Healthtech OS'
  }
];

export const Device3DViewer: React.FC<Device3DViewerProps> = ({
  currentScreenIndex = 0,
  onScreenChange,
  scrollProgress = 0
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeDesignIndex, setActiveDesignIndex] = useState(currentScreenIndex);
  const [autoRotate, setAutoRotate] = useState(true);
  const screenTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setActiveDesignIndex(currentScreenIndex);
  }, [currentScreenIndex]);

  // Render the Screen UI onto the 2D Offscreen Canvas for Three.js Texture
  const updateOffscreenCanvas = (index: number) => {
    let canvas = offscreenCanvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 640;
      offscreenCanvasRef.current = canvas;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const screenData = DESIGN_SCREENS[index];
    
    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 1024, 640);
    grad.addColorStop(0, screenData.bgGradient[0]);
    grad.addColorStop(1, screenData.bgGradient[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 640);

    // Grid lines background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1024; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 640);
      ctx.stroke();
    }
    for (let y = 0; y < 640; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // Top Window Header Bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, 1024, 50);
    
    // Window dots
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(30, 25, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#eab308';
    ctx.beginPath(); ctx.arc(50, 25, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath(); ctx.arc(70, 25, 6, 0, Math.PI * 2); ctx.fill();

    // Window Title
    ctx.fillStyle = '#9ca3af';
    ctx.font = '600 16px sans-serif';
    ctx.fillText(`NexusCraft Showcase // ${screenData.title}`, 100, 31);

    // Main Card Glass Panel
    ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(40, 80, 580, 520, 16);
    ctx.fill();
    ctx.stroke();

    // Sidebar Glass Panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.roundRect(640, 80, 344, 520, 16);
    ctx.fill();
    ctx.stroke();

    // Title Text on Left Panel
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(screenData.title, 70, 140);

    ctx.fillStyle = screenData.color;
    ctx.font = '600 20px sans-serif';
    ctx.fillText(screenData.subtitle, 70, 180);

    // Decorative UI Nodes & Graphs based on design index
    if (index === 0) { // Neura AI
      // AI Telemetry graph
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(70, 480);
      ctx.bezierCurveTo(200, 300, 350, 500, 570, 260);
      ctx.stroke();

      // Glowing nodes
      [70, 200, 350, 570].forEach((x, i) => {
        const y = [480, 380, 450, 260][i];
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(6, 182, 212, 0.3)';
        ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fill();
      });

      // Stats boxes inside Sidebar
      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.roundRect(660, 110, 304, 100, 12);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('99.94% Accuracy', 680, 155);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.fillText('LLM Telemetry Latency: 12ms', 680, 185);

    } else if (index === 1) { // Veloce
      // EV Speedometer circle
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.arc(330, 340, 140, Math.PI * 0.8, Math.PI * 2.2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 64px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('184', 330, 340);
      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#10b981';
      ctx.fillText('KM / H — SPORT MODE', 330, 380);
      ctx.textAlign = 'left';

    } else if (index === 2) { // Krypton Pay
      // Yield Chart
      ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
      ctx.beginPath();
      ctx.moveTo(70, 520);
      ctx.lineTo(200, 400);
      ctx.lineTo(350, 440);
      ctx.lineTo(570, 220);
      ctx.lineTo(570, 520);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText('$184,920.45', 70, 150);
      ctx.fillStyle = '#a855f7';
      ctx.font = '18px sans-serif';
      ctx.fillText('+24.8% APY Auto-Compounding Vault', 70, 190);

    } else { // Aura Health
      // Circadian sleep curve
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(70, 340);
      ctx.quadraticCurveTo(330, 120, 570, 340);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px sans-serif';
      ctx.fillText('HRV Score: 96', 70, 150);
      ctx.fillStyle = '#f97316';
      ctx.font = '18px sans-serif';
      ctx.fillText('Deep Sleep State: Optimal (8h 14m)', 70, 190);
    }

    if (screenTextureRef.current) {
      screenTextureRef.current.needsUpdate = true;
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.5, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 3, 20);
    purpleLight.position.set(-6, -2, 4);
    scene.add(purpleLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 3, 20);
    cyanLight.position.set(6, 4, 3);
    scene.add(cyanLight);

    // Create 3D Laptop Group
    const laptopGroup = new THREE.Group();

    // 1. Base / Keyboard Deck
    const baseGeo = new THREE.BoxGeometry(5.2, 0.2, 3.4);
    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2
    });
    const baseMesh = new THREE.Mesh(baseGeo, darkMetalMat);
    baseMesh.position.y = -1.2;
    laptopGroup.add(baseMesh);

    // Keyboard accent recessed area
    const kbGeo = new THREE.BoxGeometry(4.6, 0.05, 1.8);
    const kbMat = new THREE.MeshStandardMaterial({ color: 0x030712, roughness: 0.7 });
    const kbMesh = new THREE.Mesh(kbGeo, kbMat);
    kbMesh.position.set(0, -1.08, -0.2);
    laptopGroup.add(kbMesh);

    // Trackpad
    const tpGeo = new THREE.BoxGeometry(1.6, 0.02, 1.0);
    const tpMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const tpMesh = new THREE.Mesh(tpGeo, tpMat);
    tpMesh.position.set(0, -1.08, 1.0);
    laptopGroup.add(tpMesh);

    // 2. Display Screen Lid Assembly
    const screenGroup = new THREE.Group();
    screenGroup.position.set(0, -1.1, -1.6); // Hinge location

    // Lid Casing
    const lidGeo = new THREE.BoxGeometry(5.2, 3.4, 0.15);
    const lidMesh = new THREE.Mesh(lidGeo, darkMetalMat);
    lidMesh.position.set(0, 1.7, 0);
    screenGroup.add(lidMesh);

    // Screen Glass Display Bezel
    const screenGlassGeo = new THREE.PlaneGeometry(4.9, 3.1);

    // Create offscreen texture
    updateOffscreenCanvas(activeDesignIndex);
    const screenTexture = new THREE.CanvasTexture(offscreenCanvasRef.current!);
    screenTextureRef.current = screenTexture;

    const screenMat = new THREE.MeshBasicMaterial({
      map: screenTexture
    });
    const screenMesh = new THREE.Mesh(screenGlassGeo, screenMat);
    screenMesh.position.set(0, 1.7, 0.081);
    screenGroup.add(screenMesh);

    // Glowing Bezel Rim
    const rimGeo = new THREE.BoxGeometry(5.24, 3.44, 0.05);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.3 });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.set(0, 1.7, -0.02);
    screenGroup.add(rimMesh);

    // Open Screen Lid to ~105 degrees
    screenGroup.rotation.x = -0.25;

    laptopGroup.add(screenGroup);
    scene.add(laptopGroup);

    // Background Particle Stars
    const particlesCount = 200;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 20;
      posArray[i + 1] = (Math.random() - 0.5) * 15;
      posArray[i + 2] = (Math.random() - 0.5) * 15;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.6
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    // Animation & Smooth Interaction Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Floating particles rotation
      particleSystem.rotation.y = elapsedTime * 0.03;

      // Rotate Laptop based on scroll & time
      if (autoRotate) {
        laptopGroup.rotation.y = Math.sin(elapsedTime * 0.4) * 0.25 + scrollProgress * Math.PI * 0.5;
        laptopGroup.rotation.x = Math.cos(elapsedTime * 0.5) * 0.08 + scrollProgress * 0.2;
        laptopGroup.rotation.z = Math.sin(elapsedTime * 0.3) * 0.04;
      } else {
        laptopGroup.rotation.y = THREE.MathUtils.lerp(laptopGroup.rotation.y, scrollProgress * Math.PI * 0.4, 0.05);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update screen texture whenever active index changes
  useEffect(() => {
    updateOffscreenCanvas(activeDesignIndex);
  }, [activeDesignIndex]);

  const handleSelectScreen = (idx: number) => {
    setActiveDesignIndex(idx);
    if (onScreenChange) onScreenChange(idx);
  };

  return (
    <div className="relative w-full h-[520px] md:h-[620px] flex flex-col items-center justify-center">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Micro-Badges */}
      <div className="absolute top-6 left-6 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs font-mono text-cyan-300 border border-cyan-500/30 animate-float">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span>3D WebGL Device Engine // 60FPS</span>
      </div>

      <div className="absolute top-12 right-6 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs font-mono text-purple-300 border border-purple-500/30 animate-float" style={{ animationDelay: '2s' }}>
        <Layers className="w-3.5 h-3.5 text-purple-400" />
        <span>Morphing Design Texture</span>
      </div>

      {/* Screen Selection Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-2xl glass-card border border-slate-700/60 shadow-2xl z-20 max-w-[95%] overflow-x-auto no-scrollbar">
        {DESIGN_SCREENS.map((screen, idx) => (
          <button
            key={screen.id}
            onClick={() => handleSelectScreen(idx)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              activeDesignIndex === idx
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-500/25 scale-105'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 hover:text-white'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: screen.color }}
            />
            <span>{screen.title}</span>
          </button>
        ))}

        <button
          onClick={() => setAutoRotate(!autoRotate)}
          title="Toggle Auto 3D Rotation"
          className={`p-2 rounded-xl text-xs font-medium transition-all ${
            autoRotate ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '10s' }} />
        </button>
      </div>
    </div>
  );
};
