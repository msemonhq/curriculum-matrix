import React from 'react';
import { motion } from 'framer-motion';

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string;
};

export function IconButton({ label, className = '', children, ...props }: IconButtonProps) {
  return (
    <motion.button
      type={props.type || 'button'}
      aria-label={label || props['aria-label']}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
      className={`min-h-11 min-w-11 p-2.5 rounded-full bg-transparent hover:bg-surface-subtle text-ink-secondary hover:text-ink-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base disabled:opacity-40 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
