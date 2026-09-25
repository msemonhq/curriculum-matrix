import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function TextArea({ label, className = '', id, ...props }: TextAreaProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-caption text-ink-secondary mb-1.5 font-medium">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`w-full bg-surface-subtle border border-line rounded-xl px-3 py-2.5 text-body text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-line-focus focus:ring-2 focus:ring-accent/20 transition-all resize-none ${
          className
        }`}
        {...props}
      />
    </div>
  );
}
