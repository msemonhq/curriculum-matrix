import React from 'react';

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Which edge carries the hairline that separates this block from its neighbour. */
  rule?: 'top' | 'bottom' | 'none';
  /** Vertical breathing room inside the rules. Content never gets side padding: it sits on the page. */
  padding?: 'none' | 'normal' | 'large';
}

/** A block of content that sits on the page and is separated from its neighbours by a hairline. */
export function Section({ rule = 'top', padding = 'normal', className = '', children, ...props }: SectionProps) {
  const ruleClasses = { top: 'border-t', bottom: 'border-b', none: '' };
  const paddingClasses = { none: '', normal: 'py-4', large: 'py-6' };

  return (
    <div className={`border-rule ${ruleClasses[rule]} ${paddingClasses[padding]} ${className}`} {...props}>
      {children}
    </div>
  );
}
