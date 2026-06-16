import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaArrowRight, FaExternalLinkAlt, FaGithub } from 'react-icons/fa';

export const Lightbox = ({ lightboxData, setLightboxData }) => {
  const { project, activeIndex, isOpen } = lightboxData;

  const closeLightbox = useCallback(() => {
    setLightboxData(prev => ({ ...prev, isOpen: false }));
  }, [setLightboxData]);

  const handleNext = useCallback((e) => {
    e?.stopPropagation();
    if (!project || !project.images) return;
    setLightboxData(prev => ({
      ...prev,
      activeIndex: (prev.activeIndex + 1) % project.images.length
    }));
  }, [project, setLightboxData]);

  const handlePrev = useCallback((e) => {
    e?.stopPropagation();
    if (!project || !project.images) return;
    setLightboxData(prev => ({
      ...prev,
      activeIndex: (prev.activeIndex - 1 + project.images.length) % project.images.length
    }));
  }, [project, setLightboxData]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeLightbox, handleNext, handlePrev]);

  if (!isOpen || !project) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeLightbox}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 md:p-8 cursor-zoom-out backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative max-w-6xl w-full max-h-[95vh] lg:max-h-[90vh] bg-base brutal-border p-2 md:p-4 shadow-[10px_10px_0px_0px_rgba(255,214,10,1)] flex flex-col cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button 
            className="absolute -top-3 -right-3 md:-top-4 md:-right-4 w-10 h-10 bg-primary brutal-border rounded-full flex items-center justify-center font-black text-xl hover:bg-white transition-colors z-20 shadow-[2px_2px_0px_0px_var(--color-black)]"
            onClick={closeLightbox}
            aria-label="Close Lightbox"
          >
            ×
          </button>

          {/* Main Image Area */}
          <div className="relative w-full flex-grow bg-white brutal-border overflow-hidden flex items-center justify-center min-h-[40vh] md:min-h-[60vh] max-h-[70vh]">
            <img 
              src={project.images[activeIndex]} 
              alt={`${project.title} Screenshot ${activeIndex + 1}`} 
              className="w-full h-full object-contain"
            />
            
            {/* Nav Buttons */}
            {project.images.length > 1 && (
              <>
                <button 
                  onClick={handlePrev}
                  aria-label="Previous Image"
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white brutal-border p-2 md:p-3 shadow-[4px_4px_0px_0px_var(--color-black)] hover:bg-[#FFD60A] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--color-black)] active:translate-y-0 active:shadow-none transition-all z-10"
                >
                  <FaArrowLeft />
                </button>
                <button 
                  onClick={handleNext}
                  aria-label="Next Image"
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white brutal-border p-2 md:p-3 shadow-[4px_4px_0px_0px_var(--color-black)] hover:bg-[#FFD60A] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--color-black)] active:translate-y-0 active:shadow-none transition-all z-10"
                >
                  <FaArrowRight />
                </button>
              </>
            )}
            
            {/* Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1 text-xs md:text-sm font-bold brutal-border shadow-[2px_2px_0px_0px_var(--color-white)]">
              {activeIndex + 1} / {project.images.length}
            </div>
          </div>

          {/* Project Details Footer */}
          <div className="mt-4 px-2 flex flex-col md:flex-row md:items-end justify-between gap-4 overflow-y-auto">
            <div>
              <h3 className="text-xl md:text-3xl font-black">{project.title}</h3>
              <p className="font-medium text-gray-600 dark:text-gray-300 transition-colors duration-300 mt-1">{project.subtitle}</p>
            </div>
            {project.links && (
              <div className="flex flex-wrap gap-3">
                <a 
                  href={project.links.liveDemo} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="brutal-btn bg-[#FFD60A] text-xs sm:text-sm px-4 py-2 flex items-center gap-2 hover:-translate-y-1 transition-all"
                >
                  <FaExternalLinkAlt /> Live Demo
                </a>
                <a 
                  href={project.links.github} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="brutal-btn bg-black text-white text-xs sm:text-sm px-4 py-2 flex items-center gap-2 hover:-translate-y-1 transition-all"
                >
                  <FaGithub /> GitHub Repo
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
