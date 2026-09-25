import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  fullWidth?: boolean;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  fullWidth,
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex min-h-11 items-center justify-center gap-2 font-semibold rounded-xl py-3 px-5 text-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base disabled:cursor-not-allowed disabled:opacity-40';
  const variants = {
    primary: 'bg-accent text-surface-base hover:bg-accent/90 active:bg-accent/80',
    secondary: 'bg-surface-subtle border border-line text-ink-primary hover:bg-surface-overlay active:bg-surface-overlay',
    ghost: 'bg-transparent text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle',
    outline: 'bg-transparent border border-accent text-accent hover:bg-accent-dim active:bg-accent-dim',
    danger: 'bg-danger text-surface-base hover:bg-danger/90 active:bg-danger/80',
  };

  return (
    <motion.button
      type={props.type || 'button'}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full flex-1' : ''} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
      {loading && <span className="sr-only">Loading</span>}
    </motion.button>
  );
}
