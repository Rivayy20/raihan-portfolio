import React from 'react';
import { motion } from 'framer-motion';

export const Section = ({ id, title, subtitle, children, className = '' }) => {
  return (
    <section id={id} className={`py-20 md:py-32 ${className}`}>
      <div className="flex flex-col gap-12">
        {(title || subtitle) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4 max-w-3xl"
          >
            {title && (
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xl md:text-2xl font-medium text-gray-700 dark:text-gray-300 border-l-4 border-black pl-4 transition-colors duration-300">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}
        
        {children}
      </div>
    </section>
  );
};
