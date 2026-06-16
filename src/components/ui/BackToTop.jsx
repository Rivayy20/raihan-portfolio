import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronUp } from 'react-icons/fa';
import { smoothScrollTo } from '../../utils/scrollTo';

export const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => smoothScrollTo(e, '#')}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 w-12 h-12 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_var(--color-black)] hover:shadow-[2px_2px_0px_0px_var(--color-black)] rounded-xl flex items-center justify-center text-black hover:-translate-y-1 transition-all active:scale-95"
          aria-label="Back to Top"
        >
          <FaChevronUp className="text-xl" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
