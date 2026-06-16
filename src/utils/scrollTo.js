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
