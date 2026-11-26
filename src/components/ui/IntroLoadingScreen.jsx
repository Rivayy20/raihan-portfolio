import { motion, useReducedMotion } from 'framer-motion';
import { isSpiderManPreset } from '../../constants/colorPresets';
import { useTheme } from '../../hooks/useTheme';
import { EDITORIAL_EASE } from '../../utils/motionVariants';
import { SpiderMaskEmblem, SpiderWebCorner } from './SpiderManElements';

export const IntroLoadingScreen = ({
  brandName = 'RAZH',
  colorPreset = 'razh_cyan',
}) => {
  const reduceMotion = useReducedMotion();
  const { theme, resolvedTheme } = useTheme();
  const displayBrand = (brandName || 'RAZH').trim();
  const isLight = theme === 'light';
  const isSpiderMan =
    resolvedTheme?.isSpiderMan || isSpiderManPreset(colorPreset);
  const showWebDecor = resolvedTheme?.config?.effects?.webBackground !== false;

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={`Loading ${displayBrand} portfolio`}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: {
          duration: reduceMotion ? 0.2 : 0.72,
          ease: EDITORIAL_EASE,
        },
      }}
      className="fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden select-none px-6 text-ink"
      style={{
        backgroundColor: 'var(--color-canvas)',
        backgroundImage: isLight
          ? 'radial-gradient(circle at 50% 45%, var(--color-surface) 0%, var(--color-canvas) 66%, var(--color-surface-subtle) 100%)'
          : 'radial-gradient(circle at 50% 44%, var(--color-electric-glow) 0%, var(--color-surface) 38%, var(--color-canvas) 76%)',
      }}
    >
      {/* Subtle grain texture matching Hero */}
      <div
        aria-hidden="true"
        className="hero-grain-overlay pointer-events-none absolute inset-0"
      />

      {(isSpiderMan || showWebDecor) && (
        <>
          <SpiderWebCorner
            position="top-right"
            animated
            style={{ color: 'var(--color-web-line)' }}
            className="pointer-events-none absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 opacity-75"
          />
          <SpiderWebCorner
            position="bottom-left"
            animated
            style={{ color: 'var(--color-electric-blue)' }}
            className="pointer-events-none absolute bottom-0 left-0 w-44 sm:w-56 h-44 sm:h-56 opacity-[0.14]"
          />
        </>
      )}

      {/* Theme-aware central ambient glow behind monogram */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute w-80 sm:w-115 h-80 sm:h-115 rounded-full blur-3xl opacity-35"
        style={{
          background:
            'radial-gradient(circle, var(--color-web-glow), var(--color-electric-glow) 52%, transparent 76%)',
        }}
      />

      <motion.div
        initial={
          reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 10 }
        }
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={
          reduceMotion
            ? { opacity: 0, transition: { duration: 0.15 } }
            : {
                opacity: 0,
                scale: 0.96,
                y: -6,
                transition: { duration: 0.42, ease: EDITORIAL_EASE },
              }
        }
        transition={{
          duration: reduceMotion ? 0.25 : 0.85,
          ease: EDITORIAL_EASE,
        }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        {isSpiderMan ? (
          <SpiderMaskEmblem
            className="w-16 h-16 mb-5"
            style={{ filter: 'drop-shadow(0 0 22px var(--color-spider-sense-glow))' }}
          />
        ) : (
          /* Minimalist Custom RAZH Monogram Emblem consuming centralized tokens */
          <svg
            width="58"
            height="58"
            viewBox="0 0 64 64"
            fill="none"
            aria-hidden="true"
            className="mb-5"
            style={{ filter: 'drop-shadow(0 0 18px var(--color-web-glow))' }}
          >
            <motion.rect
              x="8"
              y="8"
              width="48"
              height="48"
              rx="14"
              stroke="var(--color-border-strong)"
              strokeWidth="1.5"
              initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: EDITORIAL_EASE }}
            />
            <motion.path
              d="M23 44V20H34.5C39.2 20 42.5 23 42.5 27.3C42.5 31.3 39.6 34.2 35.1 34.6L42.5 44"
              stroke="var(--color-ink)"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.0, delay: 0.15, ease: EDITORIAL_EASE }}
            />
            <motion.circle
              cx="23"
              cy="44"
              r="2.2"
              fill="var(--color-primary)"
              initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.65, ease: EDITORIAL_EASE }}
            />
          </svg>
        )}

        <span
          className="font-heading font-semibold text-2xl sm:text-3xl tracking-[0.38em] pl-[0.38em] uppercase text-ink"
          style={{ textShadow: '0 0 22px var(--color-web-glow)' }}
        >
          {displayBrand}
        </span>

        {/* Thin horizontal indeterminate loading sweep */}
        <div
          aria-hidden="true"
          className="mt-8 w-36 sm:w-44 h-0.5 rounded-full bg-ink/12 overflow-hidden"
        >
          <span
            className="intro-loading-bar block h-full w-1/2 rounded-full"
            style={{ boxShadow: '0 0 12px var(--color-web-glow)' }}
          />
        </div>

        <span className="sr-only">
          Loading portfolio content, please wait.
        </span>
      </motion.div>
    </motion.div>
  );
};
