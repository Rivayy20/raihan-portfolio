import { useEffect } from 'react';
import Lenis from 'lenis';

export const useLenis = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    let lenis = null;
    let rafId = null;

    function raf(time) {
      if (!lenis) return;
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    const startLenis = () => {
      if (lenis) return;
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
      });

      window.lenis = lenis;
      rafId = requestAnimationFrame(raf);
    };

    const stopLenis = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (lenis) {
        lenis.destroy();
        lenis = null;
      }
      window.lenis = null;
    };

    const handleMotionChange = (e) => {
      if (e.matches) {
        stopLenis();
      } else {
        startLenis();
      }
    };

    if (!motionQuery?.matches) {
      startLenis();
    }

    motionQuery?.addEventListener?.('change', handleMotionChange);

    return () => {
      motionQuery?.removeEventListener?.('change', handleMotionChange);
      stopLenis();
    };
  }, []);
};
