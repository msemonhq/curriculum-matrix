import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function TextInput({ label, className = '', id, ...props }: TextInputProps) {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-meta text-ink-secondary mb-1.5 font-medium">{label}</label>}
      <input
        id={id}
        className={`min-h-11 w-full bg-surface-subtle border border-edge rounded-xl px-3 py-2.5 text-body text-ink-primary placeholder:text-ink-tertiary transition-colors focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      />
    </div>
  );
}
