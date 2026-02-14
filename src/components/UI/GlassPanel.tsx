import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'light' | 'strong';
  animated?: boolean;
}

export default function GlassPanel({ 
  children, 
  className = '', 
  variant = 'default',
  animated = true 
}: GlassPanelProps) {
  const variantClasses = {
    default: 'glass-panel',
    light: 'glass-panel-light',
    strong: 'glass-panel-strong',
  };

  const Component = animated ? motion.div : 'div';
  const animationProps = animated ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  } : {};

  return (
    <Component
      className={`${variantClasses[variant]} rounded-2xl ${className}`}
      {...animationProps}
    >
      {children}
    </Component>
  );
}