import { useState } from 'react';
import { motion, useScroll, useSpring, useMotionValueEvent } from 'framer-motion';

export const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const [percent, setPercent] = useState(0);

  // Smooth out the scroll progress with a spring
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Update percentage state for the text display
  useMotionValueEvent(scaleY, "change", (latest) => {
    setPercent(Math.round(latest * 100));
  });

  return (
    <div className="hidden lg:flex fixed top-1/2 -translate-y-1/2 right-4 xl:right-8 flex-col items-center gap-3 z-50 pointer-events-none">
      
      {/* Scroll Text */}
      <div className="font-heading font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 rotate-90 mb-6">
        Scroll
      </div>

      {/* Track */}
      <div className="w-3 xl:w-4 h-48 xl:h-64 bg-white brutal-border border-2 overflow-hidden shadow-[4px_4px_0px_0px_var(--color-black)] relative">
        <motion.div 
          className="absolute top-0 left-0 w-full h-full bg-accent origin-top"
          style={{ scaleY }}
        />
      </div>

      {/* Percentage */}
      <div className="font-heading font-black text-xs w-8 text-center text-black dark:text-white mt-1">
        {percent}%
      </div>
    </div>
  );
};
