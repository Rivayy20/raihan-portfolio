import { useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export const TypewriterText = ({
  text = '',
  start = true,
  startDelayMs = 0,
  speedMs = 30,
  className = '',
}) => {
  const reduceMotion = useReducedMotion();
  const chars = useMemo(() => Array.from(String(text || '')), [text]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [showCursor, setShowCursor] = useState(false);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    if (reduceMotion || !start || chars.length === 0 || hasCompletedRef.current) {
      return undefined;
    }

    let intervalId = null;
    let hideCursorTimeoutId = null;

    const startTimeoutId = window.setTimeout(() => {
      setShowCursor(true);
      let current = 0;

      intervalId = window.setInterval(() => {
        current += 1;
        setVisibleCount(current);

        if (current >= chars.length) {
          hasCompletedRef.current = true;
          if (intervalId !== null) {
            window.clearInterval(intervalId);
            intervalId = null;
          }
          hideCursorTimeoutId = window.setTimeout(() => {
            setShowCursor(false);
          }, 550);
        }
      }, speedMs);
    }, startDelayMs);

    return () => {
      window.clearTimeout(startTimeoutId);
      if (intervalId !== null) window.clearInterval(intervalId);
      if (hideCursorTimeoutId !== null) window.clearTimeout(hideCursorTimeoutId);
    };
  }, [chars, reduceMotion, speedMs, start, startDelayMs]);

  if (!text) return null;

  if (reduceMotion) {
    return <p className={className}>{text}</p>;
  }

  const displayedText = chars.slice(0, visibleCount).join('');

  return (
    <p className={`relative ${className}`}>
      <span className="sr-only">{text}</span>
      {/* Invisible full-text placeholder reserves final multi-line height (zero layout shift) */}
      <span aria-hidden="true" className="invisible select-none block">
        {text}
      </span>
      <span aria-hidden="true" className="absolute inset-0 block">
        {displayedText}
        {showCursor && (
          <span className="hero-cursor-blink inline-block w-0.5 h-[1.05em] align-[-0.14em] ml-0.5 rounded-full bg-primary" />
        )}
      </span>
    </p>
  );
};
