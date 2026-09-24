import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
}

export function Button({ variant = 'primary', fullWidth, className = '', children, ...props }: ButtonProps) {
  const baseClasses = "font-semibold rounded-xl py-3 shadow-sm transition-colors focus:outline-none";
  
  const variantClasses = {
    primary: "bg-rokomari-teal text-white hover:bg-rokomari-darkTeal active:bg-rokomari-darkTeal",
    secondary: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-50",
    danger: "bg-danger text-white hover:bg-red-600 active:bg-red-700"
  };

  const widthClass = fullWidth ? "w-full flex-1" : "";
  const combinedClassName = `${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`;

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
}
