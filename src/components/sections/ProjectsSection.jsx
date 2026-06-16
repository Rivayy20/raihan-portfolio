import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Lightbox } from '../ui/Lightbox';
import { projectsData } from '../../data/projects';
import { FaExternalLinkAlt, FaGithub, FaArrowLeft, FaArrowRight, FaInfoCircle } from 'react-icons/fa';

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => {
  return Math.abs(offset) * velocity;
};

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

export const ProjectsSection = () => {
  const [[page, direction], setPage] = useState([0, 0]);
  const [lightboxData, setLightboxData] = useState({ project: null, activeIndex: 0, isOpen: false });

  const openLightbox = (project, index) => {
    setLightboxData({ project, activeIndex: index, isOpen: true });
  };

  const carouselIndex = ((page % projectsData.length) + projectsData.length) % projectsData.length;
  const project = projectsData[carouselIndex];

  const paginate = (newDirection) => {
    setPage([page + newDirection, newDirection]);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        paginate(1);
      } else if (e.key === 'ArrowLeft') {
        paginate(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [page]);

  return (
    <Section 
      id="projects" 
      title="Featured Projects" 
      subtitle="Selected works showcasing my ability to solve problems across different domains."
    >
      <div className="flex flex-col gap-6">
        
        {/* Navigation & Controls Top */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="font-black text-xl hidden sm:block px-4 py-2 bg-white brutal-border brutal-shadow">
            Project {carouselIndex + 1} / {projectsData.length}
          </div>
          <div className="flex gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <button 
              className="flex items-center gap-2 px-6 py-3 bg-white brutal-border brutal-shadow hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all font-bold"
              onClick={() => paginate(-1)}
            >
              <FaArrowLeft /> Prev
            </button>
            <div className="font-black text-xl sm:hidden flex items-center px-4 py-2 bg-white brutal-border">
              {carouselIndex + 1} / {projectsData.length}
            </div>
            <button 
              className="flex items-center gap-2 px-6 py-3 bg-white brutal-border brutal-shadow hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all font-bold"
              onClick={() => paginate(1)}
            >
              Next <FaArrowRight />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="w-full overflow-hidden px-1 py-1">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={carouselIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              className="w-full"
            >
              <Card className="flex flex-col lg:flex-row overflow-hidden p-0 border-r-4 border-b-4 bg-white cursor-grab active:cursor-grabbing shadow-[4px_4px_0px_0px_var(--color-black)]">
                
                {/* Image Area (Collage Desktop / Scroll Mobile) */}
                <div className={`w-full lg:w-5/12 ${project.color} border-b-4 lg:border-b-0 lg:border-r-4 border-black p-4 md:p-6 lg:p-8 relative overflow-hidden flex flex-col justify-center`}>
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
                  
                  {/* Desktop Grid Collage (Hidden on Mobile/Tablet) */}
                  <div className="hidden lg:grid grid-cols-2 grid-rows-2 gap-4 relative z-10 aspect-[4/5] xl:aspect-[3/4]">
                    {project.images.map((imgSrc, idx) => (
                      <div 
                        key={idx}
                        onClick={() => openLightbox(project, idx)}
                        className={`relative brutal-border overflow-hidden cursor-zoom-in group/img bg-white shadow-[4px_4px_0px_0px_var(--color-black)] hover:shadow-[6px_6px_0px_0px_var(--color-black)] hover:-translate-y-1 transition-all ${
                          idx === 0 ? 'col-span-2 row-span-1' : 'col-span-1 row-span-1'
                        }`}
                      >
                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors z-10 flex items-center justify-center">
                          <span className="opacity-0 group-hover/img:opacity-100 bg-white text-black font-bold px-3 py-1 brutal-border scale-90 group-hover/img:scale-100 transition-all pointer-events-none shadow-[2px_2px_0px_0px_var(--color-black)]">🔍 Preview</span>
                        </div>
                        <img 
                          src={imgSrc} 
                          alt={`${project.title} Screenshot ${idx + 1}`} 
                          loading="lazy"
                          className="w-full h-full object-cover object-top group-hover/img:scale-105 transition-transform duration-500" 
                        />
                      </div>
                    ))}
                  </div>

                  {/* Mobile/Tablet Scroll Snap Gallery */}
                  <div className="flex lg:hidden overflow-x-auto snap-x snap-mandatory gap-4 pb-4 pt-2 px-2 -mx-2 hide-scrollbar relative z-10">
                    {project.images.map((imgSrc, idx) => (
                      <div 
                        key={idx}
                        onClick={() => openLightbox(project, idx)}
                        className="w-[85%] sm:w-[70%] shrink-0 snap-center brutal-border overflow-hidden cursor-zoom-in group/img bg-white shadow-[4px_4px_0px_0px_var(--color-black)] active:scale-[0.98] transition-transform"
                      >
                        <div className="relative aspect-[4/3] sm:aspect-video w-full">
                          <div className="absolute inset-0 bg-black/0 active:bg-black/10 transition-colors z-10 flex items-center justify-center pointer-events-none">
                            <span className="opacity-0 active:opacity-100 bg-white text-black font-bold px-3 py-1 brutal-border scale-90 active:scale-100 transition-all shadow-[2px_2px_0px_0px_var(--color-black)]">🔍</span>
                          </div>
                          <img 
                            src={imgSrc} 
                            alt={`${project.title} Screenshot ${idx + 1}`} 
                            loading="lazy"
                            className="w-full h-full object-cover object-top" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content Area */}
                <div className="w-full lg:w-7/12 p-6 md:p-8 lg:p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge color="white">{project.category}</Badge>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black mb-3 leading-tight">{project.title}</h3>
                    <p className="text-xl font-bold text-gray-600 dark:text-gray-300 transition-colors duration-300 mb-8">{project.subtitle}</p>
                    
                    <div className="grid grid-cols-1 gap-6 mb-8 mt-6">
                      {/* Problem */}
                      <div>
                        <h4 className="font-black text-xl mb-2 flex items-center gap-2">
                          <span className="w-6 h-6 bg-accent brutal-border flex items-center justify-center text-sm">?</span>
                          Problem
                        </h4>
                        <p className="font-medium text-gray-800 dark:text-gray-300 transition-colors duration-300">{project.problem}</p>
                      </div>
                      
                      {/* Solution */}
                      <div>
                        <h4 className="font-black text-xl mb-2 flex items-center gap-2">
                          <span className="w-6 h-6 bg-primary brutal-border flex items-center justify-center text-sm">!</span>
                          Solution
                        </h4>
                        <p className="font-medium text-gray-800 dark:text-gray-300 transition-colors duration-300">{project.solution}</p>
                      </div>

                      {/* Impact */}
                      {project.impact && (
                        <div>
                          <h4 className="font-black text-xl mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 bg-[#FFD60A] brutal-border flex items-center justify-center text-sm">★</span>
                            Impact / Outcome
                          </h4>
                          <ul className="list-disc list-inside font-medium text-gray-800 dark:text-gray-300 transition-colors duration-300 marker:text-primary">
                            {project.impact.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="mb-8">
                      <h4 className="font-black text-lg mb-3">Tech Stack</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.tech.map((tech, i) => (
                          <span key={i} className="bg-gray-100 dark:bg-[#1A1A1A] border-2 border-black px-3 py-1 text-sm font-bold transition-colors duration-300">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-dashed border-black/20 mt-auto">
                    <a href={project.links?.liveDemo} target="_blank" rel="noopener noreferrer" className="brutal-btn bg-white text-sm px-6 py-3 flex items-center gap-2 flex-1 justify-center hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--color-black)] transition-all">
                      <FaExternalLinkAlt /> Live Demo
                    </a>
                    <a href={project.links?.github} target="_blank" rel="noopener noreferrer" className="brutal-btn bg-black text-white text-sm px-6 py-3 flex items-center gap-2 flex-1 justify-center hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--color-black)] transition-all">
                      <FaGithub /> Source
                    </a>
                  </div>
                </div>

              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Dot Indicators */}
        <div className="flex justify-center mt-4">
          <div className="flex gap-3">
            {projectsData.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const newDirection = idx > carouselIndex ? 1 : -1;
                  setPage([idx, newDirection]);
                }}
                className={`w-3 h-3 rounded-full border-2 border-black transition-all ${
                  idx === carouselIndex ? 'bg-black scale-150' : 'bg-white'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>

      {lightboxData.isOpen && (
        <Lightbox 
          lightboxData={lightboxData} 
          setLightboxData={setLightboxData} 
        />
      )}
    </Section>
  );
};
