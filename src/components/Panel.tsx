import React from 'react';

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'small' | 'normal' | 'large';
}

/** The one raised surface. Use it only where the person can type or tap: a form, the next step. */
export function Panel({ padding = 'normal', className = '', children, ...props }: PanelProps) {
  const paddingClasses = { none: '', small: 'p-3', normal: 'p-4', large: 'p-6' };

  return (
    <div className={`bg-surface-elevated border border-rule rounded-xl ${paddingClasses[padding]} ${className}`} {...props}>
      {children}
    </div>
  );
}
