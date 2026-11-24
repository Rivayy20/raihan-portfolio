import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';

// Animates height: auto so dynamic content is never cut off. Overflow is only
// clipped while the height is animating, so shadows and focus rings stay visible.
export const Collapse = ({ show, id, as = 'div', className, children }) => {
  const MotionTag = motion[as];
  const reduceMotion = useReducedMotion();
  const transition = { duration: reduceMotion ? 0 : 0.25, ease: 'easeInOut' };

  return (
    <AnimatePresence initial={false}>
      {show && (
        <MotionTag
          id={id}
          className={className}
          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
          animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
          exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
          transition={transition}
        >
          {children}
        </MotionTag>
      )}
    </AnimatePresence>
  );
};

// A single down chevron that rotates to point up while open.
export const Chevron = ({ isOpen }) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.span
      aria-hidden="true"
      className="inline-flex"
      animate={{ rotate: isOpen ? 180 : 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeInOut' }}
    >
      <FaChevronDown />
    </motion.span>
  );
};
