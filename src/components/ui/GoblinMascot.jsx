import React from 'react';
import { motion } from 'framer-motion';

export default function GoblinMascot({ size = 'md', className = '', animate = true }) {
  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  };

  const Wrapper = animate ? motion.div : 'div';
  const animationProps = animate ? {
    animate: { y: [0, -5, 0] },
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
  } : {};

  return (
    <Wrapper {...animationProps} className={`${sizes[size]} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Body */}
        <ellipse cx="50" cy="60" rx="30" ry="25" fill="#7C3AED" />
        
        {/* Head */}
        <circle cx="50" cy="35" r="25" fill="#A78BFA" />
        
        {/* Ears */}
        <path d="M20 35 L10 15 L30 30 Z" fill="#A78BFA" />
        <path d="M80 35 L90 15 L70 30 Z" fill="#A78BFA" />
        <path d="M22 33 L14 18 L28 30 Z" fill="#C4B5FD" />
        <path d="M78 33 L86 18 L72 30 Z" fill="#C4B5FD" />
        
        {/* Eyes */}
        <ellipse cx="40" cy="32" rx="8" ry="9" fill="white" />
        <ellipse cx="60" cy="32" rx="8" ry="9" fill="white" />
        <circle cx="42" cy="33" r="4" fill="#1E1B4B" />
        <circle cx="62" cy="33" r="4" fill="#1E1B4B" />
        <circle cx="43" cy="31" r="1.5" fill="white" />
        <circle cx="63" cy="31" r="1.5" fill="white" />
        
        {/* Eyebrows */}
        <path d="M32 24 Q40 20 48 24" stroke="#1E1B4B" strokeWidth="2" fill="none" />
        <path d="M52 24 Q60 20 68 24" stroke="#1E1B4B" strokeWidth="2" fill="none" />
        
        {/* Nose */}
        <ellipse cx="50" cy="42" rx="4" ry="3" fill="#8B5CF6" />
        
        {/* Mouth */}
        <path d="M40 50 Q50 58 60 50" stroke="#1E1B4B" strokeWidth="2" fill="none" />
        
        {/* Smart glasses */}
        <rect x="30" y="28" width="18" height="12" rx="2" fill="none" stroke="#34D399" strokeWidth="2" />
        <rect x="52" y="28" width="18" height="12" rx="2" fill="none" stroke="#34D399" strokeWidth="2" />
        <line x1="48" y1="34" x2="52" y2="34" stroke="#34D399" strokeWidth="2" />
        <line x1="30" y1="34" x2="20" y2="32" stroke="#34D399" strokeWidth="2" />
        <line x1="70" y1="34" x2="80" y2="32" stroke="#34D399" strokeWidth="2" />
        
        {/* Arms */}
        <ellipse cx="25" cy="65" rx="8" ry="12" fill="#A78BFA" />
        <ellipse cx="75" cy="65" rx="8" ry="12" fill="#A78BFA" />
        
        {/* Crypto coin */}
        <circle cx="78" cy="58" r="8" fill="#34D399" />
        <text x="78" y="62" textAnchor="middle" fontSize="10" fill="#1E1B4B" fontWeight="bold">◎</text>
        
        {/* Feet */}
        <ellipse cx="38" cy="83" rx="10" ry="5" fill="#8B5CF6" />
        <ellipse cx="62" cy="83" rx="10" ry="5" fill="#8B5CF6" />
      </svg>
    </Wrapper>
  );
}