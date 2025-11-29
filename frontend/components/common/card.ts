import React from "react";

export type CardProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

export const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
