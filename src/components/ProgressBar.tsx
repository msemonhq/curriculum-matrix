import React from 'react';

interface ProgressBarProps {
  progress: number;
  className?: string;
}

export function ProgressBar({ progress, className = '' }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <div className={`w-full bg-gray-100 rounded-full h-2.5 overflow-hidden ${className}`}>
      <div 
        className="bg-rokomari-teal h-2.5 rounded-full transition-all duration-500" 
        style={{ width: `${clampedProgress}%` }}
      ></div>
    </div>
  );
}
