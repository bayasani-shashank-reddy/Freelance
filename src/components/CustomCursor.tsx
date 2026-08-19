import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  active: boolean;
};

const themeColors: Record<string, string> = {
  hero: '#818cf8',
  designers: '#22d3ee',
  brief: '#a78bfa',
  workflow: '#38bdf8',
  testimonials: '#f472b6',
};

export const CustomCursor: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(true); // Default to true to prevent hydration mismatch/flicker
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const colorRef = useRef(themeColors.hero);

  useEffect(() => {
    // Check if device supports hover (desktop) vs touch (mobile)
    const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsMobile(!hasHover);

    if (!hasHover || reducedMotion) return;

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      const themedSection = (e.target as HTMLElement | null)?.closest?.('[data-section-theme]');
      const theme = themedSection?.getAttribute('data-section-theme') ?? 'hero';
      colorRef.current = themeColors[theme] ?? themeColors.hero;

      const particle = particlesRef.current.find((item) => !item.active);
      if (particle) {
        particle.x = e.clientX;
        particle.y = e.clientY;
        particle.vx = (Math.random() - 0.5) * 0.8;
        particle.vy = (Math.random() - 0.5) * 0.8;
        particle.life = 1;
        particle.maxLife = 28;
        particle.size = 2 + Math.random() * 4;
        particle.color = colorRef.current;
        particle.active = true;
      }
    };

    const updateHoverState = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if hovering over interactive elements
      const isClickable = 
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') !== null ||
        target.closest('a') !== null ||
        window.getComputedStyle(target).cursor === 'pointer';
      
      setIsHovering(isClickable);
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', updateHoverState);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', updateHoverState);
    };
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    particlesRef.current = Array.from({ length: 18 }, () => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 28,
      size: 2,
      color: themeColors.hero,
      active: false,
    }));

    let animationFrame = 0;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * ratio);
      canvas.height = Math.floor(window.innerHeight * ratio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = () => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particlesRef.current.forEach((particle) => {
        if (!particle.active) return;

        const progress = particle.life / particle.maxLife;
        const opacity = Math.max(0, 1 - progress);
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life += 1;

        context.save();
        context.globalCompositeOperation = 'lighter';
        context.shadowBlur = 14;
        context.shadowColor = particle.color;
        context.fillStyle = particle.color;
        context.globalAlpha = opacity * 0.7;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size * (1 - progress * 0.45), 0, Math.PI * 2);
        context.fill();
        context.restore();

        if (particle.life >= particle.maxLife) {
          particle.active = false;
        }
      });
      animationFrame = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[9997] pointer-events-none mix-blend-screen"
        aria-hidden="true"
      />
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 bg-cyan-400 rounded-full mix-blend-screen pointer-events-none z-[9999]"
        animate={{
          x: mousePosition.x - 8,
          y: mousePosition.y - 8,
          scale: isHovering ? 2 : 1,
          opacity: isHovering ? 0.8 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
          mass: 0.5
        }}
      />
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-indigo-400 rounded-full mix-blend-screen pointer-events-none z-[9998]"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
          scale: isHovering ? 1.5 : 1,
          opacity: isHovering ? 0 : 0.5,
        }}
        transition={{
          type: "spring",
          stiffness: 250,
          damping: 20,
          mass: 0.8
        }}
      />
    </>
  );
};
