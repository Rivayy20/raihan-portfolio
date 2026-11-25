import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FaChevronUp } from 'react-icons/fa';
import { smoothScrollTo } from '../../utils/scrollTo';

export const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.92 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => smoothScrollTo(e, '#')}
          className="fixed bottom-6 right-5 md:bottom-8 md:right-8 z-40 w-11 h-11 rounded-full bg-surface/90 backdrop-blur-md border border-border-strong shadow-sm flex items-center justify-center text-ink hover:border-primary hover:text-primary hover:-translate-y-0.5 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label="Back to Top"
        >
          <FaChevronUp className="text-sm" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
