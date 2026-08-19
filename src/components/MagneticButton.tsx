import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

interface MagneticButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  strength?: number;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({ 
  children, 
  strength = 30, 
  className = '', 
  ...props 
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = buttonRef.current.getBoundingClientRect();
    const x = ((clientX - left) / width - 0.5) * strength;
    const y = ((clientY - top) / height - 0.5) * strength;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`relative inline-flex items-center justify-center ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
