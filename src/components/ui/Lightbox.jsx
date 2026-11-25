import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  FaArrowLeft,
  FaArrowRight,
  FaExternalLinkAlt,
  FaGithub,
  FaTimes,
} from 'react-icons/fa';
import { EDITORIAL_EASE } from '../../utils/motionVariants';

function normalizeLightboxImage(entry, projectTitle, idx) {
  if (!entry) return null;
  if (typeof entry === 'string') {
    return {
      url: entry,
      alt: `${projectTitle} detailed project view ${idx + 1}`,
      caption: '',
    };
  }
  return {
    url: entry.url || '',
    alt: entry.alt || `${projectTitle} detailed project view ${idx + 1}`,
    caption: entry.caption || '',
  };
}

export const Lightbox = ({ lightboxData, setLightboxData }) => {
  const reduceMotion = useReducedMotion();
  const { project, activeIndex, isOpen } = lightboxData;
  const images = project?.images || [];
  const safeIndex =
    images.length > 0
      ? ((activeIndex % images.length) + images.length) % images.length
      : 0;

  const closeLightbox = useCallback(() => {
    setLightboxData((prev) => ({ ...prev, isOpen: false }));
  }, [setLightboxData]);

  const handleNext = useCallback(
    (e) => {
      e?.stopPropagation();
      if (!images.length) return;
      setLightboxData((prev) => ({
        ...prev,
        activeIndex: (prev.activeIndex + 1) % images.length,
      }));
    },
    [images.length, setLightboxData]
  );

  const handlePrev = useCallback(
    (e) => {
      e?.stopPropagation();
      if (!images.length) return;
      setLightboxData((prev) => ({
        ...prev,
        activeIndex: (prev.activeIndex - 1 + images.length) % images.length,
      }));
    },
    [images.length, setLightboxData]
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeLightbox, handleNext, handlePrev]);

  const activeImage =
    isOpen && project && images.length > 0
      ? normalizeLightboxImage(images[safeIndex], project.title, safeIndex)
      : null;
  const liveDemoUrl = project?.links?.liveDemo;
  const githubUrl = project?.links?.github;

  return (
    <AnimatePresence>
      {isOpen && project && images.length > 0 && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`${project.title} preview`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.15 : 0.25 }}
          onClick={closeLightbox}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#101012]/90 p-3 sm:p-6 md:p-10 cursor-zoom-out backdrop-blur-xl"
        >
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { scale: 0.97, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { scale: 0.97, y: 16, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.25, ease: EDITORIAL_EASE }}
            className="relative max-w-6xl w-full max-h-[92vh] bg-surface border border-border-subtle rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Row */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="font-heading text-lg sm:text-2xl font-medium text-ink truncate">
                    {project.title}
                  </h3>
                  <span className="shrink-0 rounded-full bg-surface-subtle border border-border-subtle px-2.5 py-0.5 text-xs font-medium text-muted tabular-nums">
                    {String(safeIndex + 1).padStart(2, '0')} /{' '}
                    {String(images.length).padStart(2, '0')}
                  </span>
                </div>
                {activeImage?.caption ? (
                  <p className="text-sm text-muted mt-1">{activeImage.caption}</p>
                ) : (
                  project.subtitle && (
                    <p className="text-sm text-muted mt-1">{project.subtitle}</p>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={closeLightbox}
                aria-label="Close Lightbox"
                className="w-9 h-9 rounded-full border border-border-subtle flex items-center justify-center text-muted hover:text-ink hover:bg-surface-subtle transition-colors shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <FaTimes aria-hidden="true" className="text-sm" />
              </button>
            </div>

            {/* Main Image Viewport */}
            <div className="relative w-full grow bg-surface-subtle rounded-xl border border-border-subtle overflow-hidden flex items-center justify-center min-h-[40vh] md:min-h-[58vh] max-h-[68vh]">
              <AnimatePresence mode="wait" initial={false}>
                {activeImage?.url && (
                  <motion.img
                    key={activeImage.url || safeIndex}
                    src={activeImage.url}
                    alt={activeImage.alt}
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.985 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reduceMotion ? undefined : { opacity: 0 }}
                    transition={{ duration: 0.22, ease: EDITORIAL_EASE }}
                    className="w-full h-full object-contain"
                  />
                )}
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous Image"
                    className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface/90 backdrop-blur-md border border-border-subtle text-ink flex items-center justify-center shadow-md hover:border-primary hover:text-primary transition-all cursor-pointer z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <FaArrowLeft aria-hidden="true" className="text-xs" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next Image"
                    className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface/90 backdrop-blur-md border border-border-subtle text-ink flex items-center justify-center shadow-md hover:border-primary hover:text-primary transition-all cursor-pointer z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <FaArrowRight aria-hidden="true" className="text-xs" />
                  </button>
                </>
              )}
            </div>

            {/* Footer Action Links */}
            {(liveDemoUrl || githubUrl) && (
              <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                {liveDemoUrl && (
                  <a
                    href={liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border-strong px-5 py-2 text-xs sm:text-sm font-medium text-ink hover:bg-surface-subtle transition-colors"
                  >
                    <FaExternalLinkAlt aria-hidden="true" className="text-[11px]" /> Live Demo
                  </a>
                )}
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-ink text-canvas hover:bg-primary hover:text-[#171719] px-5 py-2 text-xs sm:text-sm font-medium transition-colors"
                  >
                    <FaGithub aria-hidden="true" /> Source Code
                  </a>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
