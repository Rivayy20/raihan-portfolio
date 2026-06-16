import React from 'react';

export const Badge = ({ children, className = '', color = 'accent' }) => {
  const colorClasses = {
    accent: 'bg-accent',
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    white: 'bg-base',
  };

  return (
    <span className={`brutal-badge ${colorClasses[color]} ${className}`}>
      {children}
    </span>
  );
};
