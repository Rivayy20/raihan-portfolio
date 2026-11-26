import {
  motion,
  useScroll,
  useSpring,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import { isSpiderManPreset } from '../../constants/colorPresets';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { SpiderIcon } from './SpiderManElements';

export const ScrollProgress = () => {
  const portfolioCtx = usePortfolioData();
  const isSpiderMan = isSpiderManPreset(portfolioCtx?.data?.settings?.colorPreset);
  const previewOffsetTop = portfolioCtx?.previewOffsetTop;
  const { scrollYProgress } = useScroll();
  const reduceMotion = useReducedMotion();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 32,
    restDelta: 0.001,
  });

  const spiderLeft = useTransform(
    scaleX,
    (v) => `${Math.min(99, Math.max(0.5, v * 100)).toFixed(2)}%`
  );

  if (reduceMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed left-0 right-0 h-[2px] z-55 pointer-events-none"
      style={{ top: previewOffsetTop || 0 }}
    >
      <motion.div
        className="w-full h-full origin-left sunset-gradient-line"
        style={{ scaleX }}
      />
      {isSpiderMan && (
        <motion.span
          style={{ left: spiderLeft }}
          className="absolute -top-1 -translate-x-1/2 text-primary drop-shadow-[0_0_6px_rgba(230,36,41,0.55)]"
        >
          <SpiderIcon className="w-3 h-3 rotate-180" />
        </motion.span>
      )}
    </div>
  );
};
