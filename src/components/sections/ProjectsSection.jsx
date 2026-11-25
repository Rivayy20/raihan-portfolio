import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Lightbox } from '../ui/Lightbox';
import { getProjectPanelColor } from '../../constants/colorPresets';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { smoothScrollTo } from '../../utils/scrollTo';
import {
  FaExternalLinkAlt,
  FaGithub,
  FaArrowLeft,
  FaArrowRight,
  FaImages,
} from 'react-icons/fa';

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => Math.abs(offset) * velocity;

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

function normalizeGalleryImage(img, projectTitle, idx) {
  if (typeof img === 'string') {
    return {
      id: `img-${idx}`,
      url: img,
      alt: `${projectTitle} project interface preview ${idx + 1}`,
    };
  }
  return {
    id: img.id || `img-${idx}`,
    url: img.url,
    alt: img.alt || `${projectTitle} project interface preview ${idx + 1}`,
  };
}

export const ProjectsSection = ({ sectionConfig }) => {
  const { data } = usePortfolioData();
  const projects = data.projects || [];

  const [[page, direction], setPage] = useState([0, 0]);
  const [lightboxData, setLightboxData] = useState({
    project: null,
    activeIndex: 0,
    isOpen: false,
  });

  const openLightbox = (selectedProject, index) => {
    setLightboxData({ project: selectedProject, activeIndex: index, isOpen: true });
  };

  const paginate = (newDirection) => {
    if (projects.length <= 1) return;
    setPage(([prevPage]) => [prevPage + newDirection, newDirection]);
  };

  useEffect(() => {
    if (projects.length <= 1 || lightboxData.isOpen) return undefined;

    const handleKeyDown = (e) => {
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowRight') {
        setPage(([prevPage]) => [prevPage + 1, 1]);
      } else if (e.key === 'ArrowLeft') {
        setPage(([prevPage]) => [prevPage - 1, -1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [projects.length, lightboxData.isOpen]);

  const title = sectionConfig?.title || 'Featured Projects';
  const subtitle =
    sectionConfig?.subtitle ||
    'Selected works showcasing my ability to solve problems across different domains.';
  const alignment = sectionConfig?.contentAlignment || 'left';

  if (projects.length === 0) {
    return (
      <Section id="projects" title={title} subtitle={subtitle} alignment={alignment}>
        <Card className="bg-white p-8 text-center">
          <p className="font-bold text-lg text-black">
            Projects are currently being updated. Check back soon!
          </p>
        </Card>
      </Section>
    );
  }

  const carouselIndex = ((page % projects.length) + projects.length) % projects.length;
  const project = projects[carouselIndex];
  const projectPanelColor = getProjectPanelColor(project.colorPreset);
  const projectImages = (project.images || []).map((img, idx) =>
    normalizeGalleryImage(img, project.title, idx)
  );
  const desktopPreviewImages = projectImages.slice(0, 3);
  const extraScreenshotCount = Math.max(0, projectImages.length - 3);
  const liveDemoUrl = project.links?.liveDemo;
  const githubUrl = project.links?.github;
  const isAnchorLiveDemo = String(liveDemoUrl || '').trim().startsWith('#');

  return (
    <Section id="projects" title={title} subtitle={subtitle} alignment={alignment}>
      <div className="flex flex-col gap-6">
        {/* Navigation & Controls Top */}
        {projects.length > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="font-black text-xl hidden sm:block px-4 py-2 bg-white brutal-border brutal-shadow">
              Project {carouselIndex + 1} / {projects.length}
            </div>
            <div className="flex gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <button
                type="button"
                className="flex items-center gap-2 px-6 py-3 bg-white brutal-border brutal-shadow hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all font-bold cursor-pointer"
                onClick={() => paginate(-1)}
              >
                <FaArrowLeft /> Prev
              </button>
              <div className="font-black text-xl sm:hidden flex items-center px-4 py-2 bg-white brutal-border">
                {carouselIndex + 1} / {projects.length}
              </div>
              <button
                type="button"
                className="flex items-center gap-2 px-6 py-3 bg-white brutal-border brutal-shadow hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all font-bold cursor-pointer"
                onClick={() => paginate(1)}
              >
                Next <FaArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* Carousel Container */}
        <div className="w-full overflow-hidden px-1 py-1">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={project.id || carouselIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              drag={projects.length > 1 ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                if (projects.length <= 1) return;
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
                <div
                  className={`w-full lg:w-5/12 ${projectPanelColor} border-b-4 lg:border-b-0 lg:border-r-4 border-black p-4 md:p-6 lg:p-8 relative overflow-hidden flex flex-col justify-center`}
                >
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: 'radial-gradient(#000 2px, transparent 2px)',
                      backgroundSize: '20px 20px',
                    }}
                  />

                  {projectImages.length === 0 ? (
                    <div className="relative z-10 aspect-[4/3] lg:aspect-[4/5] bg-white/80 brutal-border flex flex-col items-center justify-center p-6 text-center text-black shadow-[4px_4px_0px_0px_var(--color-black)]">
                      <FaImages className="text-4xl mb-2 opacity-60" />
                      <p className="font-bold text-sm">Preview screenshot coming soon</p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Grid Collage */}
                      <div
                        className={`hidden lg:grid gap-4 relative z-10 aspect-[4/5] xl:aspect-[3/4] ${
                          desktopPreviewImages.length === 1
                            ? 'grid-cols-1 grid-rows-1'
                            : desktopPreviewImages.length === 2
                              ? 'grid-cols-1 grid-rows-2'
                              : 'grid-cols-2 grid-rows-2'
                        }`}
                      >
                        {desktopPreviewImages.map((imgItem, idx) => {
                          const spanClass =
                            desktopPreviewImages.length >= 3
                              ? idx === 0
                                ? 'col-span-2 row-span-1'
                                : 'col-span-1 row-span-1'
                              : 'col-span-1 row-span-1';

                          return (
                            <div
                              key={imgItem.id}
                              onClick={() => openLightbox(project, idx)}
                              className={`relative brutal-border overflow-hidden cursor-zoom-in group/img bg-white shadow-[4px_4px_0px_0px_var(--color-black)] hover:shadow-[6px_6px_0px_0px_var(--color-black)] hover:-translate-y-1 transition-all ${spanClass}`}
                            >
                              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors z-10 flex items-center justify-center">
                                <span className="opacity-0 group-hover/img:opacity-100 bg-white text-black font-bold px-3 py-1 brutal-border scale-90 group-hover/img:scale-100 transition-all pointer-events-none shadow-[2px_2px_0px_0px_var(--color-black)]">
                                  🔍 Preview
                                </span>
                              </div>
                              {idx === 2 && extraScreenshotCount > 0 && (
                                <span className="absolute bottom-2 right-2 z-20 bg-black text-white text-xs font-black px-2 py-1 border-2 border-white">
                                  +{extraScreenshotCount}
                                </span>
                              )}
                              <img
                                src={imgItem.url}
                                alt={imgItem.alt}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover object-top group-hover/img:scale-105 transition-transform duration-500"
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Mobile/Tablet Scroll Snap Gallery */}
                      <div className="flex lg:hidden overflow-x-auto snap-x snap-mandatory gap-4 pb-4 pt-2 px-2 -mx-2 hide-scrollbar relative z-10">
                        {projectImages.map((imgItem, idx) => (
                          <div
                            key={imgItem.id}
                            onClick={() => openLightbox(project, idx)}
                            className="w-[85%] sm:w-[70%] shrink-0 snap-center brutal-border overflow-hidden cursor-zoom-in group/img bg-white shadow-[4px_4px_0px_0px_var(--color-black)] active:scale-[0.98] transition-transform"
                          >
                            <div className="relative aspect-[4/3] sm:aspect-video w-full">
                              <img
                                src={imgItem.url}
                                alt={imgItem.alt}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover object-top"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Content Area */}
                <div className="w-full lg:w-7/12 p-6 md:p-8 lg:p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge color="white">{project.category}</Badge>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black mb-3 leading-tight">
                      {project.title}
                    </h3>
                    {project.subtitle && (
                      <p className="text-xl font-bold text-gray-600 dark:text-gray-300 transition-colors duration-300 mb-8">
                        {project.subtitle}
                      </p>
                    )}

                    {project.description && (
                      <p className="font-medium text-gray-800 dark:text-gray-300 mb-6 leading-relaxed">
                        {project.description}
                      </p>
                    )}

                    <div className="grid grid-cols-1 gap-6 mb-8 mt-6">
                      {project.problem && (
                        <div>
                          <h4 className="font-black text-xl mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 bg-accent brutal-border flex items-center justify-center text-sm">
                              ?
                            </span>
                            Problem
                          </h4>
                          <p className="font-medium text-gray-800 dark:text-gray-300 transition-colors duration-300">
                            {project.problem}
                          </p>
                        </div>
                      )}

                      {project.solution && (
                        <div>
                          <h4 className="font-black text-xl mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 bg-primary brutal-border flex items-center justify-center text-sm">
                              !
                            </span>
                            Solution
                          </h4>
                          <p className="font-medium text-gray-800 dark:text-gray-300 transition-colors duration-300">
                            {project.solution}
                          </p>
                        </div>
                      )}

                      {project.impact && project.impact.length > 0 && (
                        <div>
                          <h4 className="font-black text-xl mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 bg-[#FFD60A] brutal-border flex items-center justify-center text-sm">
                              ★
                            </span>
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

                    {project.tech && project.tech.length > 0 && (
                      <div className="mb-8">
                        <h4 className="font-black text-lg mb-3">Tech Stack</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.tech.map((tech, i) => (
                            <span
                              key={i}
                              className="bg-gray-100 dark:bg-[#1A1A1A] border-2 border-black px-3 py-1 text-sm font-bold transition-colors duration-300"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {(liveDemoUrl || githubUrl) && (
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-dashed border-black/20 mt-auto">
                      {liveDemoUrl && (
                        <a
                          href={liveDemoUrl}
                          target={isAnchorLiveDemo ? undefined : '_blank'}
                          rel={isAnchorLiveDemo ? undefined : 'noopener noreferrer'}
                          onClick={
                            isAnchorLiveDemo
                              ? (e) => smoothScrollTo(e, liveDemoUrl)
                              : undefined
                          }
                          className="brutal-btn bg-white text-sm px-6 py-3 flex items-center gap-2 flex-1 justify-center hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--color-black)] transition-all"
                        >
                          <FaExternalLinkAlt /> Live Demo
                        </a>
                      )}
                      {githubUrl && (
                        <a
                          href={githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="brutal-btn bg-black text-white text-sm px-6 py-3 flex items-center gap-2 flex-1 justify-center hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--color-black)] transition-all"
                        >
                          <FaGithub /> Source
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Dot Indicators */}
        {projects.length > 1 && (
          <div className="flex justify-center mt-4">
            <div className="flex gap-3">
              {projects.map((item, idx) => (
                <button
                  type="button"
                  key={item.id || idx}
                  onClick={() => {
                    const newDirection = idx > carouselIndex ? 1 : -1;
                    setPage([idx, newDirection]);
                  }}
                  className={`w-3 h-3 rounded-full border-2 border-black transition-all cursor-pointer ${
                    idx === carouselIndex ? 'bg-black scale-150' : 'bg-white'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {lightboxData.isOpen && (
        <Lightbox lightboxData={lightboxData} setLightboxData={setLightboxData} />
      )}
    </Section>
  );
};
