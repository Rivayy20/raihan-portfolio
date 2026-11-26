import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FaChevronUp } from 'react-icons/fa';
import { isSpiderManPreset } from '../../constants/colorPresets';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { smoothScrollTo } from '../../utils/scrollTo';
import { SpiderIcon, WebSplatAnchor } from './SpiderManElements';

function buildBraidedWebPath(x, startY, topY) {
  const span = Math.max(80, startY - topY);
  const steps = Math.max(8, Math.min(18, Math.round(span / 52)));
  const seg = span / steps;
  let d = `M ${x.toFixed(1)} ${startY.toFixed(1)}`;
  for (let i = 0; i < steps; i++) {
    const yEnd = startY - (i + 1) * seg;
    const yMid = startY - (i + 0.5) * seg;
    const amp = i % 2 === 0 ? 7 : -7;
    d += ` Q ${(x + amp).toFixed(1)} ${yMid.toFixed(1)} ${x.toFixed(1)} ${yEnd.toFixed(1)}`;
  }
  return d;
}

export const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [webZip, setWebZip] = useState(null);
  const buttonRef = useRef(null);
  const timersRef = useRef([]);
  const reduceMotion = useReducedMotion();
  const portfolioCtx = usePortfolioData();
  const isSpiderMan = isSpiderManPreset(portfolioCtx?.data?.settings?.colorPreset);

  const clearZipTimers = () => {
    for (const timerId of timersRef.current) {
      window.clearTimeout(timerId);
    }
    timersRef.current = [];
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearZipTimers();
    };
  }, []);

  const braidedWebPath = useMemo(() => {
    if (!webZip) return '';
    return buildBraidedWebPath(webZip.x, webZip.startY, webZip.topY);
  }, [webZip]);

  const handleClick = (e) => {
    if (!isSpiderMan || reduceMotion) {
      smoothScrollTo(e, '#');
      return;
    }

    if (e?.preventDefault) e.preventDefault();
    clearZipTimers();

    const rect = buttonRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 44;
    const startY = rect ? rect.top + rect.height / 2 : window.innerHeight - 46;
    const topY = (portfolioCtx?.previewOffsetTop || 0) + 6;

    setWebZip({
      id: Date.now(),
      x,
      startY,
      topY,
    });

    const scrollTimer = window.setTimeout(() => {
      smoothScrollTo(null, '#');
    }, 185);

    const cleanupTimer = window.setTimeout(() => {
      setWebZip(null);
    }, 950);

    timersRef.current = [scrollTimer, cleanupTimer];
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.button
            ref={buttonRef}
            type="button"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.92 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: webZip ? [1, 0.84, 1.08, 1] : 1,
            }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.92 }}
            transition={{ duration: 0.28 }}
            onClick={handleClick}
            style={
              isSpiderMan
                ? { boxShadow: '0 6px 20px -6px var(--color-web-glow)' }
                : undefined
            }
            className={`fixed bottom-6 right-5 md:bottom-8 md:right-8 z-40 w-11 h-11 rounded-full bg-surface/90 backdrop-blur-md border shadow-sm flex flex-col items-center justify-center text-ink hover:border-primary hover:text-primary hover:-translate-y-0.5 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              isSpiderMan ? 'border-primary/35' : 'border-border-strong'
            }`}
            aria-label="Back to Top"
          >
            {isSpiderMan ? (
              <>
                <SpiderIcon className="w-2.5 h-2.5 text-primary -mb-0.5" />
                <FaChevronUp className="text-[10px]" />
              </>
            ) : (
              <FaChevronUp className="text-sm" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {webZip && (
          <motion.div
            key={webZip.id}
            aria-hidden="true"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 z-55 pointer-events-none overflow-hidden"
          >
            {/* Braided dual silk strand shooting from button to top anchor */}
            <svg className="w-full h-full overflow-visible">
              <motion.path
                d={`M ${webZip.x} ${webZip.startY} L ${webZip.x} ${webZip.topY}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 6px var(--color-web-glow))' }}
                className="text-ink/80 dark:text-white/95"
                initial={{ pathLength: 0, pathOffset: 0, opacity: 0.45 }}
                animate={{
                  pathLength: [0, 1, 1, 1, 1],
                  pathOffset: [0, 0, 0, 1, 1],
                  opacity: [0.45, 0.96, 0.96, 0.3, 0],
                }}
                transition={{
                  duration: 0.85,
                  times: [0, 0.22, 0.45, 0.94, 1],
                  ease: [0.16, 1, 0.3, 1],
                }}
              />

              <motion.path
                d={braidedWebPath}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.45"
                strokeLinecap="round"
                className="text-primary"
                initial={{ pathLength: 0, pathOffset: 0, opacity: 0.35 }}
                animate={{
                  pathLength: [0, 1, 1, 1, 1],
                  pathOffset: [0, 0, 0, 1, 1],
                  opacity: [0.35, 0.92, 0.92, 0.25, 0],
                }}
                transition={{
                  duration: 0.85,
                  times: [0, 0.22, 0.45, 0.94, 1],
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
            </svg>

            {/* Top cobweb splat anchor + impact ring flash */}
            <motion.div
              style={{
                left: webZip.x,
                top: webZip.topY,
                transformOrigin: '50% 10px',
              }}
              className="absolute -translate-x-1/2 -translate-y-[10px]"
              initial={{ scale: 0.25, opacity: 0 }}
              animate={{
                scale: [0.25, 1, 1.06, 1.08],
                opacity: [0, 0.95, 0.72, 0],
              }}
              transition={{
                delay: 0.16,
                duration: 0.56,
                times: [0, 0.22, 0.65, 1],
                ease: 'easeOut',
              }}
            >
              <div className="relative flex items-start justify-center">
                <span className="absolute top-[2px] w-7 h-7 rounded-full border border-primary/70 animate-ping" />
                <WebSplatAnchor
                  style={{ filter: 'drop-shadow(0 0 8px var(--color-web-glow))' }}
                  className="w-28 h-16 text-ink/75 dark:text-white/90"
                />
              </div>
            </motion.div>

            {/* Glowing miniature Spider zipping upward along the web */}
            <motion.div
              style={{ left: webZip.x }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              initial={{ top: webZip.startY, opacity: 0, scale: 0.7 }}
              animate={{
                top: webZip.topY + 14,
                opacity: [0, 1, 1, 0],
                scale: [0.7, 1.15, 1, 0.8],
              }}
              transition={{
                delay: 0.17,
                duration: 0.52,
                times: [0, 0.18, 0.78, 1],
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <SpiderIcon
                style={{ filter: 'drop-shadow(0 0 10px var(--color-spider-sense-glow))' }}
                className="w-5 h-5 text-primary"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
