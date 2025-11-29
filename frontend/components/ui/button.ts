import React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  icon?: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  loading = false,
  disabled,
  icon,
  className = "",
  ...rest
}) => {
  const base = "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants: Record<string, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 focus:ring-gray-300",
    ghost: "bg-transparent text-blue-600 hover:bg-blue-50",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${loading || disabled ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
      disabled={loading || disabled}
      {...rest}
    >
      {loading && (
        <svg
          className="-ml-1 mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default Button;
