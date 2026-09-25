import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, className = '', id, children, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-caption text-ink-secondary mb-1.5 font-medium">{label}</label>}
      <select
        id={id}
        className={`min-h-11 w-full bg-surface-subtle border border-line rounded-xl px-3 py-2.5 text-body text-ink-primary transition-colors focus:outline-none focus:border-line-focus focus:ring-2 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
