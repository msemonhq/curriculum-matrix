import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  fullWidth?: boolean;
  loading?:  boolean;
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
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl py-3 px-5 text-body transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-40 disabled:cursor-not-allowed';

  const variants = {
    primary:   'bg-accent text-surface-base hover:bg-accent/90 active:bg-accent/80 shadow-glow-sm',
    secondary: 'bg-surface-subtle border border-line text-ink-primary hover:bg-surface-overlay active:bg-surface-overlay',
    ghost:     'bg-transparent text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle',
    outline:   'bg-transparent border border-accent text-accent hover:bg-accent-dim active:bg-accent-dim',
    danger:    'bg-danger text-surface-base hover:bg-danger/90 active:bg-danger/80',
  };

  const widthClass = fullWidth ? 'w-full flex-1' : '';

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`${base} ${variants[variant]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : null}
      {children}
    </motion.button>
  );
}
