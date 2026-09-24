import React from 'react';
import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 border border-gray-200 rounded-2xl border-dashed">
      <div className="text-gray-400 mb-3">
        {icon || <FileQuestion className="w-12 h-12" />}
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
