import React from 'react';

interface ToolInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function ToolInput({ label, error, id, className = '', ...props }: ToolInputProps) {
  const inputId = id || `tool-input-${label?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'field'}`;
  const errorId = `${inputId}-error`;

  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="block text-caption text-ink-secondary mb-1.5 font-medium">{label}</label>}
      <input
        {...props}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`min-h-11 w-full bg-surface-subtle border rounded-xl px-3 py-2.5 text-body text-ink-primary placeholder:text-ink-tertiary transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-danger focus:border-danger focus:ring-danger/30' : 'border-line focus:border-line-focus focus:ring-accent/30'} ${className}`}
      />
      {error && <p id={errorId} role="alert" className="mt-1.5 text-caption text-danger">{error}</p>}
    </div>
  );
}
