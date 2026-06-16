import React from 'react';

export const Input = ({ label, type = 'text', as = 'input', className = '', ...props }) => {
  const baseClasses = "w-full bg-white text-black p-4 border-4 border-black outline-none focus:bg-[#f4f3ec] dark:focus:bg-[#2A2A2A] transition-colors brutal-shadow focus:translate-y-[4px] focus:translate-x-[4px] focus:shadow-none font-medium";
  
  const Component = as;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="font-heading font-bold text-lg">
          {label}
        </label>
      )}
      <Component 
        type={as === 'input' ? type : undefined}
        className={baseClasses}
        {...props}
      />
    </div>
  );
};
