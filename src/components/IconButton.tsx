import React from 'react';
import { motion } from 'framer-motion';

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function IconButton({ className = '', children, ...props }: IconButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.90 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`p-2 rounded-full bg-transparent hover:bg-surface-subtle text-ink-secondary hover:text-ink-primary transition-colors focus:outline-none ${
        className
      }`}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
