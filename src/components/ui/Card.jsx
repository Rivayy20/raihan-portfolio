import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  const hasBg = className.includes('bg-');
  return (
    <div 
      className={`brutal-card ${hasBg ? '' : 'bg-white'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
