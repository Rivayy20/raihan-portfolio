export const smoothScrollTo = (e, target) => {
  if (e && e.preventDefault) {
    e.preventDefault();
  }

  // If target is '#', scroll to top
  const targetElement = target === '#' ? 0 : target;

  if (window.lenis) {
    window.lenis.scrollTo(targetElement);
  } else {
    // Fallback if Lenis is not active
    if (targetElement === 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.querySelector(targetElement);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
};

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

// Scrolls an element to the top of the viewport, respecting its CSS
// `scroll-margin-top` (Lenis and native scrollIntoView both honor it), so the
// fixed navbar offset lives in one place (--navbar-scroll-offset).
// Skips scrolling when the element is already fully visible below the navbar.
// Once the smooth scroll ends, one corrective pass fixes any drift caused by
// layout that was still animating when the scroll started.
export const scrollToElement = (element, { duration = 0.7 } = {}) => {
  if (!element) return;

  const margin = Number.parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
  const { top, bottom } = element.getBoundingClientRect();
  if (top >= margin && bottom <= window.innerHeight) return;

  const reduceMotion = prefersReducedMotion();

  if (!window.lenis) {
    element.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    return;
  }

  if (reduceMotion) {
    window.lenis.scrollTo(element, { immediate: true });
    return;
  }

  window.lenis.scrollTo(element, {
    duration,
    onComplete: () => {
      const drift = element.getBoundingClientRect().top - margin;
      if (Math.abs(drift) > 4) window.lenis?.scrollTo(element, { duration: 0.3 });
    },
  });
};
