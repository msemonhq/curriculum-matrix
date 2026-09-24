import React from 'react';

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function IconButton({ className = '', children, ...props }: IconButtonProps) {
  return (
    <button 
      className={`p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors focus:outline-none ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
}
