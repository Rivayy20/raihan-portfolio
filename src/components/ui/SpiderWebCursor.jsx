import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';

function readCursorThemeColors() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      spiderRed: '#E62429',
      electricBlue: '#2563EB',
      webLine: 'rgba(230, 36, 41, 0.25)',
      interactiveAccent: '#FF6B6B',
    };
  }
  const styles = window.getComputedStyle(document.documentElement);
  return {
    spiderRed: styles.getPropertyValue('--color-spider-red').trim() || '#E62429',
    electricBlue: styles.getPropertyValue('--color-electric-blue').trim() || '#2563EB',
    webLine: styles.getPropertyValue('--color-web-line').trim() || 'rgba(230, 36, 41, 0.25)',
    interactiveAccent:
      styles.getPropertyValue('--color-interactive-accent').trim() || '#FF6B6B',
  };
}

/**
 * Lightweight, non-blocking Spider-Web cursor trail & click particle canvas.
 * Keeps native cursor visible, disables on coarse touch devices & reduced-motion,
 * and reads centralized CSS tokens automatically.
 */
export const SpiderWebCursor = ({ enabled = true }) => {
  const { theme, resolvedTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const canvasRef = useRef(null);
  const colorsRef = useRef(readCursorThemeColors());
  const [isTouchOnly, setIsTouchOnly] = useState(() => {
    if (typeof window === 'undefined') return true;
    return Boolean(window.matchMedia?.('(pointer: coarse)').matches);
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(pointer: coarse)');
    const syncPointerType = () => setIsTouchOnly(mq.matches);
    syncPointerType();
    mq.addEventListener?.('change', syncPointerType);
    return () => mq.removeEventListener?.('change', syncPointerType);
  }, []);

  useEffect(() => {
    colorsRef.current = readCursorThemeColors();
  }, [theme, resolvedTheme]);

  const isActive = Boolean(enabled) && !reduceMotion && !isTouchOnly;

  useEffect(() => {
    if (!isActive) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let width = 0;
    let height = 0;
    let rafId = 0;
    let isInteractiveHover = false;
    const pointer = { x: -100, y: -100, visible: false };
    const trail = [];
    const particles = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const draw = () => {
      const now = performance.now();
      ctx.clearRect(0, 0, width, height);

      while (trail.length > 0 && now - trail[0].t > 290) {
        trail.shift();
      }

      const { spiderRed, electricBlue, webLine, interactiveAccent } = colorsRef.current;

      // Silk trail segments
      if (trail.length > 1) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (let i = 1; i < trail.length; i++) {
          const prev = trail[i - 1];
          const curr = trail[i];
          const life = Math.max(0, 1 - (now - curr.t) / 290);
          ctx.strokeStyle = i % 3 === 0 ? webLine : spiderRed;
          ctx.globalAlpha = life * 0.42;
          ctx.lineWidth = Math.max(0.6, life * 1.6);
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.stroke();
        }
      }

      // Micro web reticle on interactive hover
      if (pointer.visible && isInteractiveHover) {
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.strokeStyle = interactiveAccent;
        ctx.lineWidth = 1.15;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 13, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Floating silk sparks
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.life -= 0.045;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = p.life * 0.75;
        ctx.fillStyle = p.alt ? electricBlue : spiderRed;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.globalAlpha = 1;

      if (trail.length > 0 || particles.length > 0 || (pointer.visible && isInteractiveHover)) {
        rafId = window.requestAnimationFrame(draw);
      } else {
        rafId = 0;
      }
    };

    const scheduleDraw = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(draw);
      }
    };

    const handlePointerMove = (e) => {
      if (e.pointerType === 'touch') return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.visible = true;

      const target = e.target;
      isInteractiveHover =
        target instanceof Element &&
        Boolean(target.closest('a, button, [role="button"], input, textarea, select'));

      trail.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (trail.length > 18) trail.shift();

      if (particles.length < 18 && Math.random() < 0.28) {
        particles.push({
          x: e.clientX + (Math.random() - 0.5) * 6,
          y: e.clientY + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 0.9,
          vy: (Math.random() - 0.5) * 0.9,
          size: 1.9,
          life: 1,
          alt: Math.random() > 0.55,
        });
      }

      scheduleDraw();
    };

    const handlePointerDown = (e) => {
      if (e.pointerType === 'touch') return;
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6;
        const speed = 1.6 + Math.random() * 1.1;
        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2.3,
          life: 1,
          alt: i % 2 === 1,
        });
      }
      scheduleDraw();
    };

    const handlePointerLeave = () => {
      pointer.visible = false;
      isInteractiveHover = false;
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-55 pointer-events-none"
    />
  );
};
