import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'small' | 'normal' | 'large';
}

export function Card({ padding = 'normal', className = '', children, ...props }: CardProps) {
  const paddingClasses = {
    none: '',
    small: 'p-3',
    normal: 'p-4',
    large: 'p-6'
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm ${paddingClasses[padding]} ${className}`} {...props}>
      {children}
    </div>
  );
}
