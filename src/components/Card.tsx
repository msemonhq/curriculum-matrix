import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'small' | 'normal' | 'large';
  variant?: 'default' | 'glass' | 'inset';
  glow?: boolean;
  interactive?: boolean;
}

export function Card({
  padding = 'normal',
  variant = 'default',
  glow = false,
  interactive = false,
  className = '',
  children,
  ...props
}: CardProps) {
  const paddingClasses = { none: '', small: 'p-3', normal: 'p-4', large: 'p-6' };
  const variantClasses = {
    default: 'bg-surface-elevated border border-line',
    glass: 'bg-surface-elevated/70 backdrop-blur-md border border-line/60',
    inset: 'bg-surface-subtle border-0',
  };
  const interactionClasses = interactive
    ? 'hover:border-line/80 hover:-translate-y-px cursor-pointer active:scale-[0.98] active:duration-100'
    : '';

  return (
    <div
      className={`rounded-2xl transition-all duration-200 ${variantClasses[variant]} ${paddingClasses[padding]} ${glow ? 'shadow-glow-sm' : 'shadow-surface'} ${interactionClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
