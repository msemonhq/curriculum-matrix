import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-600',
    success: 'bg-success-light text-success',
    warning: 'bg-warning-light text-warning',
    danger: 'bg-danger-light text-danger',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
