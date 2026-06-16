import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  onClick,
  ...props 
}) => {
  const baseClasses = "brutal-btn flex items-center justify-center gap-2";
  const variantClasses = {
    primary: "bg-primary text-black",
    secondary: "bg-secondary text-black",
    accent: "bg-accent text-black",
    white: "bg-base text-black",
  };

  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};
