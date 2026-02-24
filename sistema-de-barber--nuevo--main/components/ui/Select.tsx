
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

export const Select: React.FC<SelectProps> = ({ label, id, children, ...props }) => {
  const selectId = id || `select-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div>
      <label htmlFor={selectId} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <select
        id={selectId}
        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
        {...props}
      >
        {children}
      </select>
    </div>
  );
};
