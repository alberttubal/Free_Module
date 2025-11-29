import React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  id?: string;
  error?: string | null;
  helper?: string | null;
};

export const Input: React.FC<InputProps> = ({ label, id, error, helper, className = "", ...rest }) => {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`block w-full rounded-lg border-gray-200 shadow-sm py-2 px-3 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error ? "border-red-400" : ""}`}
        {...rest}
      />
      {helper && <p className="mt-1 text-xs text-gray-500">{helper}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default Input;

