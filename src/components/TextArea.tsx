import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function TextArea({ label, className = '', ...props }: TextAreaProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>}
      <textarea 
        className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rokomari-teal ${className}`}
        {...props}
      />
    </div>
  );
}
