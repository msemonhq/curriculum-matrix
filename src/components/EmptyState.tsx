import React from 'react';

interface EmptyStateProps {
  title:        string;
  description?: string;
  action?:      React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-8">
      {/* Geometric illustration */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-surface-subtle border border-line flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="2" width="10" height="10" rx="2.5" fill="#00c4db" opacity="0.4"/>
            <rect x="16" y="2" width="10" height="10" rx="2.5" fill="#00c4db" opacity="0.2"/>
            <rect x="2" y="16" width="10" height="10" rx="2.5" fill="#00c4db" opacity="0.2"/>
            <rect x="16" y="16" width="10" height="10" rx="2.5" fill="#00c4db" opacity="0.1"/>
          </svg>
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-surface-elevated border border-line flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-ink-tertiary" />
        </div>
      </div>
      <h3 className="text-title text-ink-primary mb-2">{title}</h3>
      {description && (
        <p className="text-body text-ink-secondary max-w-xs">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
