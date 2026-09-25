import React from 'react';

interface ScreenHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function ScreenHeader({ eyebrow, title, description, action }: ScreenHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="min-w-0">
        {eyebrow && <p className="text-micro text-accent uppercase tracking-wider mb-1">{eyebrow}</p>}
        <h2 className="text-heading text-ink-primary">{title}</h2>
        {description && <p className="text-body text-ink-secondary mt-1">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
