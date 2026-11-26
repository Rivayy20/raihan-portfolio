import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import './InteractiveImageReveal.css';

function clampNumber(value, min, max, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

function computeMaskStops(softnessPercent) {
  const s = clampNumber(softnessPercent, 0, 100, 65);
  const hardStop = Math.round(98 - s * 0.96);
  const midStop = Math.round(hardStop + (100 - hardStop) * 0.52);
  return {
    hardStop: `${hardStop}%`,
    midStop: `${midStop}%`,
  };
}

function buildLayerImageStyle(transform, objectPosition) {
  if (!transform || typeof transform !== 'object') {
    return { objectPosition };
  }
  const scale = clampNumber(transform.scale, 50, 200, 100);
  const offsetX = clampNumber(transform.offsetX, -50, 50, 0);
  const offsetY = clampNumber(transform.offsetY, -50, 50, 0);

  if (scale === 100 && offsetX === 0 && offsetY === 0) {
    return { objectPosition };
  }

  return {
    objectPosition,
    transform: `translate3d(${offsetX}%, ${offsetY}%, 0) scale(${(scale / 100).toFixed(3)})`,
    transformOrigin: '50% 50%',
  };
}

/**
 * Reusable layered cursor-based radial image reveal component.
 * Renders a base image and conditionally reveals a registered overlay layer
 * around the pointer using requestAnimationFrame-driven CSS radial mask variables.
 */
export const InteractiveImageReveal = ({
  baseImage,
  baseAlt = 'Profile image',
  baseTransform = null,
  overlayImage = null,
  overlayTransform = null,
  enabled = false,
  revealRadius = 120,
  revealSoftness = 65,
  revealBehavior = 'smooth',
  calibrationMode = false,
  calibrationOpacity = 0.55,
  objectPosition = '50% 20%',
  className = '',
  imageClassName = '',
  fetchPriority,
  onOverlayError,
  onOverlayLoad,
}) => {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef(null);
  const activeTouchIdRef = useRef(null);
  const [failedOverlaySrc, setFailedOverlaySrc] = useState(null);

  const clampedRadius = clampNumber(revealRadius, 40, 250, 120);
  const { hardStop, midStop } = useMemo(
    () => computeMaskStops(revealSoftness),
    [revealSoftness]
  );

  const baseImageStyle = useMemo(
    () => buildLayerImageStyle(baseTransform, objectPosition),
    [baseTransform, objectPosition]
  );

  const overlayImageStyle = useMemo(
    () => buildLayerImageStyle(overlayTransform, objectPosition),
    [overlayTransform, objectPosition]
  );

  const canRenderOverlay =
    Boolean(overlayImage) &&
    failedOverlaySrc !== overlayImage;

  const showCalibrationOverlay = Boolean(calibrationMode) && canRenderOverlay;
  const isInteractiveReveal = Boolean(enabled) && canRenderOverlay && !showCalibrationOverlay;

  const isDirect = revealBehavior === 'direct' || Boolean(reduceMotion);

  const animRef = useRef({
    rafId: 0,
    isHovering: false,
    currX: 0,
    currY: 0,
    currRadius: 0,
    currOpacity: 0,
    targetX: 0,
    targetY: 0,
    targetRadius: 0,
    targetOpacity: 0,
  });

  const applyCssVars = useCallback((state) => {
    const el = rootRef.current;
    if (!el) return;
    el.style.setProperty('--reveal-x', `${state.currX.toFixed(2)}px`);
    el.style.setProperty('--reveal-y', `${state.currY.toFixed(2)}px`);
    el.style.setProperty('--reveal-radius', `${Math.max(0, state.currRadius).toFixed(2)}px`);
    el.style.setProperty('--reveal-opacity', `${Math.max(0, Math.min(1, state.currOpacity)).toFixed(3)}`);
  }, []);

  const stopRaf = useCallback(() => {
    if (animRef.current.rafId) {
      cancelAnimationFrame(animRef.current.rafId);
      animRef.current.rafId = 0;
    }
  }, []);

  const stepAnimation = useCallback(() => {
    const step = () => {
      const s = animRef.current;
      const posFactor = isDirect ? 1 : 0.22;
      const fadeFactor = reduceMotion ? 1 : isDirect ? 0.35 : 0.18;

      s.currX += (s.targetX - s.currX) * posFactor;
      s.currY += (s.targetY - s.currY) * posFactor;
      s.currRadius += (s.targetRadius - s.currRadius) * fadeFactor;
      s.currOpacity += (s.targetOpacity - s.currOpacity) * fadeFactor;

      const settled =
        Math.abs(s.targetX - s.currX) < 0.2 &&
        Math.abs(s.targetY - s.currY) < 0.2 &&
        Math.abs(s.targetRadius - s.currRadius) < 0.25 &&
        Math.abs(s.targetOpacity - s.currOpacity) < 0.005;

      if (settled) {
        s.currX = s.targetX;
        s.currY = s.targetY;
        s.currRadius = s.targetRadius;
        s.currOpacity = s.targetOpacity;
        applyCssVars(s);
        s.rafId = 0;
        return;
      }

      applyCssVars(s);
      s.rafId = requestAnimationFrame(step);
    };

    if (!animRef.current.rafId) {
      animRef.current.rafId = requestAnimationFrame(step);
    }
  }, [applyCssVars, isDirect, reduceMotion]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !isInteractiveReveal) {
      stopRaf();
      activeTouchIdRef.current = null;
      animRef.current.isHovering = false;
      animRef.current.currRadius = 0;
      animRef.current.currOpacity = 0;
      animRef.current.targetRadius = 0;
      animRef.current.targetOpacity = 0;
      if (el) {
        el.style.setProperty('--reveal-radius', '0px');
        el.style.setProperty('--reveal-opacity', '0');
      }
      return stopRaf;
    }

    el.style.setProperty('--reveal-hard-stop', hardStop);
    el.style.setProperty('--reveal-mid-stop', midStop);

    if (animRef.current.isHovering) {
      animRef.current.targetRadius = clampedRadius;
      stepAnimation();
    }

    return stopRaf;
  }, [isInteractiveReveal, hardStop, midStop, clampedRadius, stepAnimation, stopRaf]);

  const getLocalCoords = (clientX, clientY) => {
    const el = rootRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const width = el.offsetWidth || rect.width;
    const height = el.offsetHeight || rect.height;
    return {
      x: ((clientX - rect.left) / rect.width) * width,
      y: ((clientY - rect.top) / rect.height) * height,
    };
  };

  const handleActivateAt = (clientX, clientY, snapPosition = false) => {
    const coords = getLocalCoords(clientX, clientY);
    if (!coords) return;
    const s = animRef.current;
    if (snapPosition || !s.isHovering) {
      s.currX = coords.x;
      s.currY = coords.y;
    }
    s.isHovering = true;
    s.targetX = coords.x;
    s.targetY = coords.y;
    s.targetRadius = clampedRadius;
    s.targetOpacity = 1;
    stepAnimation();
  };

  const handleDeactivate = () => {
    const s = animRef.current;
    s.isHovering = false;
    s.targetOpacity = 0;
    s.targetRadius = Math.max(24, clampedRadius * 0.55);
    stepAnimation();
  };

  const handlePointerEnter = (e) => {
    if (!isInteractiveReveal || e.pointerType === 'touch') return;
    handleActivateAt(e.clientX, e.clientY, true);
  };

  const handlePointerDown = (e) => {
    if (!isInteractiveReveal || e.pointerType !== 'touch') return;
    activeTouchIdRef.current = e.pointerId;
    if (typeof e.currentTarget?.setPointerCapture === 'function') {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Ignore if pointer capture is unavailable
      }
    }
    handleActivateAt(e.clientX, e.clientY, true);
  };

  const handlePointerMove = (e) => {
    if (!isInteractiveReveal) return;
    if (e.pointerType === 'touch') {
      if (activeTouchIdRef.current !== e.pointerId) return;
      handleActivateAt(e.clientX, e.clientY, false);
      return;
    }
    handleActivateAt(e.clientX, e.clientY, false);
  };

  const handlePointerUpOrCancel = (e) => {
    if (!isInteractiveReveal || e.pointerType !== 'touch') return;
    if (activeTouchIdRef.current === e.pointerId) {
      activeTouchIdRef.current = null;
      handleDeactivate();
    }
  };

  const handlePointerLeave = (e) => {
    if (!isInteractiveReveal || e.pointerType === 'touch') return;
    handleDeactivate();
  };

  const shouldRenderOverlay = isInteractiveReveal || showCalibrationOverlay;

  return (
    <div
      ref={rootRef}
      onPointerEnter={isInteractiveReveal ? handlePointerEnter : undefined}
      onPointerDown={isInteractiveReveal ? handlePointerDown : undefined}
      onPointerMove={isInteractiveReveal ? handlePointerMove : undefined}
      onPointerUp={isInteractiveReveal ? handlePointerUpOrCancel : undefined}
      onPointerCancel={isInteractiveReveal ? handlePointerUpOrCancel : undefined}
      onPointerLeave={isInteractiveReveal ? handlePointerLeave : undefined}
      className={`interactive-reveal-root ${isInteractiveReveal ? 'touch-none' : ''} ${className}`}
    >
      <div className={`w-full h-full ${imageClassName}`}>
        <img
          src={baseImage}
          alt={baseAlt}
          fetchPriority={fetchPriority}
          decoding="async"
          draggable={false}
          style={baseImageStyle}
          className="w-full h-full object-cover"
        />
      </div>

      {shouldRenderOverlay && (
        <div
          aria-hidden="true"
          className={`interactive-reveal-overlay ${showCalibrationOverlay ? 'interactive-reveal-overlay--calibration' : ''}`}
          style={
            showCalibrationOverlay
              ? { opacity: clampNumber(calibrationOpacity, 0, 1, 0.55) }
              : undefined
          }
        >
          <div className={`w-full h-full ${imageClassName}`}>
            <img
              src={overlayImage}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              draggable={false}
              style={overlayImageStyle}
              onLoad={() => {
                onOverlayLoad?.(overlayImage);
              }}
              onError={() => {
                setFailedOverlaySrc(overlayImage);
                onOverlayError?.(overlayImage);
              }}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
};
