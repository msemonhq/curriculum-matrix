import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'accent' | 'phase';
}

export function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
  const variantClasses: Record<string, string> = {
    default: 'bg-surface-subtle text-ink-secondary',
    success: 'bg-success-dim text-success',
    warning: 'bg-warning-dim text-warning',
    danger:  'bg-danger-dim text-danger',
    accent:  'bg-accent-dim text-accent',
    phase:   'bg-accent-dim text-accent font-mono tracking-widest uppercase',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-caption font-semibold ${
        variantClasses[variant]
      } ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
