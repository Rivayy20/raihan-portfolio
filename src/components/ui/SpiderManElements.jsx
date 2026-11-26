import { motion, useReducedMotion } from 'framer-motion';
import { EDITORIAL_EASE } from '../../utils/motionVariants';

/**
 * Bespoke minimalist vector elements for Spider-Verse visual enhancements.
 * Every element consumes centralized CSS theme tokens (via currentColor or CSS vars).
 */

export const SpiderIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    {/* Head & Abdomen */}
    <path d="M12 6.2c-.85 0-1.5.62-1.5 1.4 0 .45.22.85.56 1.1-.92.55-1.56 1.6-1.56 2.85 0 1.45.82 2.72 1.98 3.25-.78.65-1.28 1.72-1.28 2.95 0 1.95 1.15 3.45 1.8 3.45s1.8-1.5 1.8-3.45c0-1.23-.5-2.3-1.28-2.95 1.16-.53 1.98-1.8 1.98-3.25 0-1.25-.64-2.3-1.56-2.85.34-.25.56-.65.56-1.1 0-.78-.65-1.4-1.5-1.4Z" />
    {/* Upper Legs */}
    <path
      d="M9.6 9.5 6.2 6.8 5.2 3.4M14.4 9.5l3.4-2.7 1-3.4M9.3 11.1 4.8 10 3.2 7.2M14.7 11.1l4.5-1.1 1.6-2.8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.55"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Lower Legs */}
    <path
      d="M9.5 12.9 5.1 14.3 4.2 18.2M14.5 12.9l4.4 1.4.9 3.9M10.1 14.4 7.1 17.5 6.7 21M13.9 14.4l3 3.1.4 3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.55"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const SpiderWebCorner = ({
  position = 'top-right',
  className = '',
  animated = false,
}) => {
  const reduceMotion = useReducedMotion();
  const shouldAnimate = Boolean(animated) && !reduceMotion;

  const transformByPos = {
    'top-right': '',
    'top-left': 'scaleX(-1)',
    'bottom-right': 'scaleY(-1)',
    'bottom-left': 'scale(-1, -1)',
  };

  const arcPaths = [
    'M192 0 Q198 18 206 32 Q220 42 240 46',
    'M142 0 Q152 34 170 64 Q202 82 240 94',
    'M90 0 Q106 54 134 98 Q180 128 240 146',
    'M40 0 Q64 72 102 130 Q162 174 240 198',
  ];

  const spokes = [
    [240, 0, 18, 0],
    [240, 0, 28, 54],
    [240, 0, 58, 112],
    [240, 0, 104, 164],
    [240, 0, 158, 202],
    [240, 0, 208, 224],
    [240, 0, 240, 226],
  ];

  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      aria-hidden="true"
      style={{ transform: transformByPos[position] || '' }}
      className={className}
    >
      {/* Radial spokes anchored at (240, 0) */}
      <g stroke="currentColor" strokeWidth="1.15" strokeLinecap="round">
        {spokes.map(([x1, y1, x2, y2], idx) =>
          shouldAnimate ? (
            <motion.line
              key={idx}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.65, delay: idx * 0.04, ease: EDITORIAL_EASE }}
            />
          ) : (
            <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2} />
          )
        )}
      </g>
      {/* Concentric web arcs */}
      <g stroke="currentColor" strokeWidth="1" fill="none">
        {arcPaths.map((d, idx) =>
          shouldAnimate ? (
            <motion.path
              key={idx}
              d={d}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.75, delay: 0.22 + idx * 0.08, ease: EDITORIAL_EASE }}
            />
          ) : (
            <path key={idx} d={d} />
          )
        )}
      </g>
    </svg>
  );
};

export const SpiderSensePulse = ({ className = '', reduceMotion = false }) => {
  if (reduceMotion) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute -inset-3.5 rounded-full ${className}`}
    >
      <span className="absolute inset-0 rounded-full border-2 spider-sense-pulse-ring" />
      <span className="absolute -inset-2 rounded-full border spider-sense-pulse-ring--delayed" />
    </div>
  );
};

export const SpiderWebHalo = ({ className = '' }) => (
  <svg
    viewBox="0 0 320 320"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <g stroke="currentColor" strokeWidth="0.9">
      {/* 12 radial spokes */}
      <line x1="160" y1="8" x2="160" y2="312" />
      <line x1="8" y1="160" x2="312" y2="160" />
      <line x1="52" y1="52" x2="268" y2="268" />
      <line x1="268" y1="52" x2="52" y2="268" />
      <line x1="84" y1="28" x2="236" y2="292" />
      <line x1="236" y1="28" x2="84" y2="292" />
      <line x1="28" y1="84" x2="292" y2="236" />
      <line x1="28" y1="236" x2="292" y2="84" />
      {/* Scalloped web rings */}
      <circle cx="160" cy="160" r="68" strokeDasharray="3 4" />
      <circle cx="160" cy="160" r="106" />
      <circle cx="160" cy="160" r="142" strokeOpacity="0.7" />
    </g>
  </svg>
);

export const SpideySenseSparks = ({ className = '' }) => (
  <svg
    viewBox="0 0 180 48"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <g stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 32 30 22 40 28 52 16" />
      <path d="M74 18 82 6 90 14 98 4 106 18" />
      <path d="M162 32 150 22 140 28 128 16" />
    </g>
  </svg>
);

export const SpiderMaskEmblem = ({ className = '' }) => (
  <svg
    viewBox="0 0 80 80"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    {/* Subtle outer web shield ring */}
    <circle
      cx="40"
      cy="40"
      r="33"
      stroke="rgba(244, 50, 56, 0.35)"
      strokeWidth="1.4"
      strokeDasharray="4 4"
    />
    {/* Crisp mask contour */}
    <path
      d="M40 12C24 12 16 24 16 39c0 15 10.5 28 24 29 13.5-1 24-14 24-29 0-15-8-27-24-27Z"
      fill="rgba(230, 36, 41, 0.14)"
      stroke="#F43238"
      strokeWidth="1.8"
    />
    {/* Fine bridge lines */}
    <path
      d="M40 12v56M18 34l22 6 22-6M21 50l19-10 19 10"
      stroke="rgba(255, 255, 255, 0.18)"
      strokeWidth="1"
    />
    {/* Iconic asymmetric angular Spider-Man eyes */}
    <path
      d="M21.5 31.5c2.2 7.5 7.4 11.4 13.8 11.2 1.1-5.2-1.2-10-6.2-11.8-2.8-1-5.4-.6-7.6.6Z"
      fill="#F4F6FB"
      stroke="#0B0E17"
      strokeWidth="2.1"
      strokeLinejoin="round"
    />
    <path
      d="M58.5 31.5c-2.2 7.5-7.4 11.4-13.8 11.2-1.1-5.2 1.2-10 6.2-11.8 2.8-1 5.4-.6 7.6.6Z"
      fill="#F4F6FB"
      stroke="#0B0E17"
      strokeWidth="2.1"
      strokeLinejoin="round"
    />
  </svg>
);

export const WebSplatAnchor = ({ className = '' }) => (
  <svg
    viewBox="0 0 120 72"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    {/* Impact latch ring near top anchor (60, 10) */}
    <circle
      cx="60"
      cy="10"
      r="4"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    {/* Radial web spokes fanning out & downward */}
    <g stroke="currentColor" strokeWidth="1.35" strokeLinecap="round">
      <line x1="60" y1="10" x2="10" y2="12" />
      <line x1="60" y1="10" x2="20" y2="38" />
      <line x1="60" y1="10" x2="40" y2="60" />
      <line x1="60" y1="10" x2="60" y2="66" />
      <line x1="60" y1="10" x2="80" y2="60" />
      <line x1="60" y1="10" x2="100" y2="38" />
      <line x1="60" y1="10" x2="110" y2="12" />
    </g>
    {/* Connecting cobweb arcs */}
    <g stroke="currentColor" strokeWidth="1.1" fill="none">
      <path d="M40 11 Q44 20 52 24 Q60 27 68 24 Q76 20 80 11" />
      <path d="M26 12 Q34 28 47 37 Q60 44 73 37 Q86 28 94 12" />
      <path d="M14 12 Q26 36 43 52 Q60 61 77 52 Q94 36 106 12" />
    </g>
  </svg>
);
