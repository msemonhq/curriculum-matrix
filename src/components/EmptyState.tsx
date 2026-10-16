import React from 'react';

interface EmptyStateProps {
  title:        string;
  description?: string;
  /** The one thing the person can do about it. */
  action?:      React.ReactNode;
}

/** An empty list says what is missing and offers one way forward. Text only: there is nothing to illustrate. */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="py-6">
      {/* The words are a live region so a screen reader hears the list go empty; the action stays outside it. */}
      <div role="status">
        <h3 className="text-title text-ink-primary">{title}</h3>
        {description && <p className="mt-1 text-body text-ink-secondary">{description}</p>}
      </div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
