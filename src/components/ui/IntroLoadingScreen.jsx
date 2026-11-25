import { motion, useReducedMotion } from 'framer-motion';
import { EDITORIAL_EASE } from '../../utils/motionVariants';

export const IntroLoadingScreen = ({ brandName = 'RAZH' }) => {
  const reduceMotion = useReducedMotion();
  const displayBrand = (brandName || 'RAZH').trim();

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
      className="fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden select-none px-6"
      style={{
        backgroundColor: '#07070D',
        backgroundImage:
          'radial-gradient(circle at 50% 46%, #1A182E 0%, #11101E 36%, #0B0B14 70%, #07070D 100%)',
      }}
    >
      {/* Subtle grain texture matching Hero */}
      <div
        aria-hidden="true"
        className="hero-grain-overlay pointer-events-none absolute inset-0"
      />

      {/* Restrained central ambient glow behind monogram */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute w-80 sm:w-115 h-80 sm:h-115 rounded-full blur-3xl opacity-15"
        style={{
          background:
            'radial-gradient(circle, rgba(255,107,107,0.18), rgba(167,139,250,0.10) 50%, transparent 75%)',
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
        {/* Minimalist Custom RAZH Monogram Emblem */}
        <svg
          width="58"
          height="58"
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
          className="mb-5 drop-shadow-[0_0_24px_rgba(255,107,107,0.22)]"
        >
          <motion.rect
            x="8"
            y="8"
            width="48"
            height="48"
            rx="14"
            stroke="rgba(248,245,240,0.22)"
            strokeWidth="1.5"
            initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: EDITORIAL_EASE }}
          />
          <motion.path
            d="M23 44V20H34.5C39.2 20 42.5 23 42.5 27.3C42.5 31.3 39.6 34.2 35.1 34.6L42.5 44"
            stroke="#F8F5F0"
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
            fill="#FF6B6B"
            initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.65, ease: EDITORIAL_EASE }}
          />
        </svg>

        <span className="font-heading font-semibold text-2xl sm:text-3xl tracking-[0.38em] pl-[0.38em] uppercase text-[#F6F3EE] drop-shadow-[0_0_24px_rgba(255,107,107,0.22)]">
          {displayBrand}
        </span>

        {/* Thin horizontal indeterminate loading sweep */}
        <div
          aria-hidden="true"
          className="mt-8 w-36 sm:w-44 h-0.5 rounded-full bg-white/12 overflow-hidden"
        >
          <span className="intro-loading-bar block h-full w-1/2 rounded-full shadow-[0_0_12px_rgba(255,107,107,0.55)]" />
        </div>

        <span className="sr-only">
          Loading portfolio content, please wait.
        </span>
      </motion.div>
    </motion.div>
  );
};
