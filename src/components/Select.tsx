import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>}
      <select 
        className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rokomari-teal ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
