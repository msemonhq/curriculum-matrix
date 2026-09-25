import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress:  number;
  className?: string;
  glow?:     boolean;
  height?:   'thin' | 'normal';
}

export function ProgressBar({
  progress,
  className = '',
  glow = false,
  height = 'normal',
}: ProgressBarProps) {
  const clamped = Math.min(Math.max(progress, 0), 100);
  const h = height === 'thin' ? 'h-0.5' : 'h-1.5';

  return (
    <div className={`w-full bg-surface-subtle rounded-full overflow-hidden ${h} ${className}`}>
      <motion.div
        className={`h-full rounded-full bg-accent ${glow ? 'shadow-glow-sm' : ''}`}
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: clamped / 100 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ width: '100%' }}
      />
    </div>
  );
}
