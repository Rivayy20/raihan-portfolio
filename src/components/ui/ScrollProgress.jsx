import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';

export const ScrollProgress = () => {
  const { previewOffsetTop } = usePortfolioData();
  const { scrollYProgress } = useScroll();
  const reduceMotion = useReducedMotion();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 32,
    restDelta: 0.001,
  });

  if (reduceMotion) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed left-0 right-0 h-[2px] z-55 pointer-events-none origin-left sunset-gradient-line"
      style={{
        top: previewOffsetTop || 0,
        scaleX,
      }}
    />
  );
};
