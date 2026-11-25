import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Lightbox } from '../ui/Lightbox';
import { getProjectPanelColor } from '../../constants/colorPresets';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { smoothScrollTo } from '../../utils/scrollTo';
import { EDITORIAL_EASE } from '../../utils/motionVariants';
import {
  FaExternalLinkAlt,
  FaGithub,
  FaArrowLeft,
  FaArrowRight,
  FaImages,
  FaExpandAlt,
} from 'react-icons/fa';

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => Math.abs(offset) * velocity;

const carouselVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 56 : -56,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.52, ease: EDITORIAL_EASE },
  },
  exit: (direction) => ({
    x: direction < 0 ? 56 : -56,
    opacity: 0,
    transition: { duration: 0.42, ease: EDITORIAL_EASE },
  }),
};

const infoContainerVariants = {
  infoHidden: { opacity: 1 },
  infoVisible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.08,
    },
  },
};

const infoItemVariants = {
  infoHidden: { opacity: 0, y: 10 },
  infoVisible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EDITORIAL_EASE },
  },
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
  const reduceMotion = useReducedMotion();

  const [[page, direction], setPage] = useState([0, 0]);
  const [activeImageByProject, setActiveImageByProject] = useState({});
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
  const isCentered = sectionConfig?.contentAlignment === 'center';

  const headerContainerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: reduceMotion ? 0 : 0.12 },
    },
  };

  const eyebrowVariants = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0.2 : 0.72, ease: EDITORIAL_EASE },
    },
  };

  const headingVariants = {
    hidden: reduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 16, filter: 'blur(6px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: reduceMotion ? 0.2 : 0.85, ease: EDITORIAL_EASE },
    },
  };

  const subtitleVariants = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0.2 : 0.78, ease: EDITORIAL_EASE },
    },
  };

  const revealBlock = (delay = 0) => ({
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0.2 : 0.75,
        delay: reduceMotion ? 0 : delay,
        ease: EDITORIAL_EASE,
      },
    },
  });

  if (projects.length === 0) {
    return (
      <section id="projects" className="py-20 sm:py-28 md:py-32 scroll-mt-24">
        <div className="flex flex-col gap-12 sm:gap-14">
          <div
            className={`flex flex-col gap-4 border-t border-border-subtle pt-8 ${
              isCentered
                ? 'mx-auto max-w-3xl items-center text-center'
                : 'max-w-3xl'
            }`}
          >
            <span className="inline-flex items-center gap-2 font-body text-xs font-medium uppercase tracking-[0.2em] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
              03 / Selected Work
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-medium tracking-[-0.03em] leading-[1.08] text-ink">
              {title}
            </h2>
            {subtitle && (
              <p className="font-body text-base sm:text-lg text-muted leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          <Card className="p-10 text-center">
            <p className="font-body text-base text-muted">
              Projects are currently being updated. Check back soon.
            </p>
          </Card>
        </div>
      </section>
    );
  }

  const carouselIndex = ((page % projects.length) + projects.length) % projects.length;
  const project = projects[carouselIndex];
  const projectKey = project.id || project.title || String(carouselIndex);
  const projectBackdrop = getProjectPanelColor(project.colorPreset);
  const projectImages = (project.images || []).map((img, idx) =>
    normalizeGalleryImage(img, project.title, idx)
  );
  const activeImageIdx =
    projectImages.length > 0
      ? Math.min(activeImageByProject[projectKey] ?? 0, projectImages.length - 1)
      : 0;
  const activeImage = projectImages[activeImageIdx] || null;
  const liveDemoUrl = project.links?.liveDemo;
  const githubUrl = project.links?.github;
  const isAnchorLiveDemo = String(liveDemoUrl || '').trim().startsWith('#');
  const outcomeList = Array.isArray(project.impact) ? project.impact.slice(0, 3) : [];

  const selectProjectImage = (idx) => {
    setActiveImageByProject((prev) => ({
      ...prev,
      [projectKey]: idx,
    }));
  };

  return (
    <section id="projects" className="py-20 sm:py-28 md:py-32 scroll-mt-24">
      <div className="flex flex-col gap-12 sm:gap-14">
        {/* Staggered Section Header */}
        <motion.div
          variants={headerContainerVariants}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className={`flex flex-col gap-4 border-t border-border-subtle pt-8 ${
            isCentered
              ? 'mx-auto max-w-3xl items-center text-center'
              : 'max-w-3xl'
          }`}
        >
          <motion.span
            variants={eyebrowVariants}
            className="inline-flex items-center gap-2 font-body text-xs font-medium uppercase tracking-[0.2em] text-muted"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            03 / Selected Work
          </motion.span>

          <motion.h2
            variants={headingVariants}
            className="font-heading text-3xl sm:text-4xl md:text-5xl font-medium tracking-[-0.03em] leading-[1.08] text-ink"
          >
            {title}
          </motion.h2>

          {subtitle && (
            <motion.p
              variants={subtitleVariants}
              className="font-body text-base sm:text-lg text-muted leading-relaxed"
            >
              {subtitle}
            </motion.p>
          )}
        </motion.div>

        <div className="flex flex-col gap-5">
          {/* Top Navigation Bar & Tabular Project Counter */}
          {projects.length > 1 && (
            <motion.div
              variants={revealBlock(0.28)}
              initial={reduceMotion ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="flex items-center justify-between gap-4"
            >
              <div className="inline-flex items-center gap-2 font-heading text-xs sm:text-sm font-medium tracking-[0.18em] text-muted tabular-nums">
                <span>PROJECT</span>
                <span className="inline-flex items-center justify-center min-w-6 overflow-hidden">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={carouselIndex}
                      initial={reduceMotion ? false : { y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={reduceMotion ? undefined : { y: -8, opacity: 0 }}
                      transition={{ duration: 0.22, ease: EDITORIAL_EASE }}
                      className="text-ink font-semibold"
                    >
                      {String(carouselIndex + 1).padStart(2, '0')}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span>/ {String(projects.length).padStart(2, '0')}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => paginate(-1)}
                  aria-label="Previous Project"
                  className="group w-10 h-10 rounded-full border border-border-subtle bg-surface flex items-center justify-center text-muted hover:text-ink hover:bg-surface-subtle hover:border-primary/60 transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <FaArrowLeft
                    aria-hidden="true"
                    className="text-xs transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:scale-105"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => paginate(1)}
                  aria-label="Next Project"
                  className="group w-10 h-10 rounded-full border border-border-subtle bg-surface flex items-center justify-center text-muted hover:text-ink hover:bg-surface-subtle hover:border-primary/60 transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <FaArrowRight
                    aria-hidden="true"
                    className="text-xs transition-transform duration-200 group-hover:translate-x-0.5 group-hover:scale-105"
                  />
                </button>
              </div>
            </motion.div>
          )}

          {/* Main Project Showcase Card with Horizontal Slide Transitions */}
          <motion.div
            variants={revealBlock(0.36)}
            initial={reduceMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, amount: 0.12 }}
            className="w-full overflow-hidden"
          >
            <AnimatePresence mode="popLayout" custom={direction} initial={false}>
              <motion.div
                key={page}
                custom={direction}
                variants={reduceMotion ? undefined : carouselVariants}
                initial={reduceMotion ? false : 'enter'}
                animate="center"
                exit={reduceMotion ? undefined : 'exit'}
                drag={projects.length > 1 && !reduceMotion ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
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
                <Card className="p-0 overflow-hidden flex flex-col lg:flex-row">
                  {/* Left Column: Primary Screenshot Focal Point + Thumbnail Strip */}
                  <div
                    className={`w-full lg:w-6/12 ${projectBackdrop} p-5 sm:p-6 lg:p-8 flex flex-col justify-center gap-4 border-b lg:border-b-0 lg:border-r border-border-subtle`}
                  >
                    {projectImages.length === 0 ? (
                      <div className="aspect-16/10 rounded-xl bg-surface/75 border border-border-subtle flex flex-col items-center justify-center p-6 text-center text-muted">
                        <FaImages aria-hidden="true" className="text-3xl mb-2 opacity-50" />
                        <p className="text-sm font-medium">Preview coming soon</p>
                      </div>
                    ) : (
                      <>
                        {/* Prominent Primary Screenshot */}
                        <button
                          type="button"
                          onClick={() => openLightbox(project, activeImageIdx)}
                          aria-label={`Open full preview of ${project.title}`}
                          className="group/preview relative aspect-16/10 w-full rounded-xl border border-black/10 dark:border-white/12 overflow-hidden bg-surface shadow-sm hover:shadow-md cursor-zoom-in transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary text-left"
                        >
                          <AnimatePresence mode="wait" initial={false}>
                            {activeImage && (
                              <motion.div
                                key={activeImage.id}
                                initial={
                                  reduceMotion ? false : { opacity: 0, scale: 0.985 }
                                }
                                animate={{ opacity: 1, scale: 1 }}
                                exit={
                                  reduceMotion ? undefined : { opacity: 0, scale: 1.01 }
                                }
                                transition={{ duration: 0.28, ease: EDITORIAL_EASE }}
                                className="w-full h-full"
                              >
                                <img
                                  src={activeImage.url}
                                  alt={activeImage.alt}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-full h-full object-cover object-top transition-all duration-500 ease-out group-hover/preview:scale-103 group-hover/preview:brightness-105 group-hover/preview:contrast-105"
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Subtle View Preview Pill on Hover */}
                          <span className="pointer-events-none absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-[#171719]/82 text-[#F6F3EE] backdrop-blur-md px-3 py-1.5 text-[11px] font-medium opacity-0 translate-y-1 group-hover/preview:opacity-100 group-hover/preview:translate-y-0 transition-all duration-200">
                            <FaExpandAlt aria-hidden="true" className="text-[10px]" />
                            <span>View Preview</span>
                          </span>
                        </button>

                        {/* Minimalist Thumbnail Navigation when multiple screenshots exist */}
                        {projectImages.length > 1 && (
                          <div
                            role="tablist"
                            aria-label={`${project.title} screenshots`}
                            className="flex items-center gap-2.5 overflow-x-auto pb-1 hide-scrollbar"
                          >
                            {projectImages.map((imgItem, idx) => {
                              const isActiveThumb = idx === activeImageIdx;
                              return (
                                <button
                                  key={imgItem.id}
                                  type="button"
                                  role="tab"
                                  aria-selected={isActiveThumb}
                                  aria-label={`View screenshot ${idx + 1} of ${projectImages.length}`}
                                  onClick={() => selectProjectImage(idx)}
                                  className={`relative w-20 sm:w-22 aspect-16/10 shrink-0 rounded-lg overflow-hidden border transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                                    isActiveThumb
                                      ? 'border-primary ring-2 ring-primary/25 opacity-100'
                                      : 'border-border-subtle opacity-65 hover:opacity-100 hover:border-border-strong'
                                  }`}
                                >
                                  <img
                                    src={imgItem.url}
                                    alt={imgItem.alt}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover object-top"
                                  />
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Right Column: Compact Case Study Information */}
                  <motion.div
                    variants={infoContainerVariants}
                    initial={reduceMotion ? false : 'infoHidden'}
                    animate="infoVisible"
                    className="w-full lg:w-6/12 p-6 sm:p-7 lg:p-8 flex flex-col justify-between gap-6"
                  >
                    <div className="space-y-4">
                      {/* Index & Category Badge + Title */}
                      <motion.div variants={infoItemVariants}>
                        <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                          <span className="font-heading text-xs font-semibold tracking-[0.18em] text-primary tabular-nums">
                            {String(carouselIndex + 1).padStart(2, '0')}
                          </span>
                          <Badge color="white">{project.category}</Badge>
                        </div>

                        <h3 className="font-heading text-2xl sm:text-3xl font-medium tracking-tight text-ink leading-tight">
                          {project.title}
                        </h3>

                        {project.subtitle && (
                          <p className="font-body text-sm sm:text-base text-muted mt-1">
                            {project.subtitle}
                          </p>
                        )}
                      </motion.div>

                      {project.description && (
                        <motion.p
                          variants={infoItemVariants}
                          className="font-body text-sm text-ink/85 leading-relaxed max-w-prose"
                        >
                          {project.description}
                        </motion.p>
                      )}

                      {/* Compact Challenge, Solution & Outcomes */}
                      <motion.div
                        variants={infoItemVariants}
                        className="space-y-3.5 pt-3.5 border-t border-border-subtle"
                      >
                        {project.problem && (
                          <div>
                            <h4 className="font-body text-[11px] font-medium uppercase tracking-[0.16em] text-muted mb-1">
                              Challenge
                            </h4>
                            <p className="font-body text-sm text-ink/85 leading-relaxed">
                              {project.problem}
                            </p>
                          </div>
                        )}

                        {project.solution && (
                          <div>
                            <h4 className="font-body text-[11px] font-medium uppercase tracking-[0.16em] text-muted mb-1">
                              Solution
                            </h4>
                            <p className="font-body text-sm text-ink/85 leading-relaxed">
                              {project.solution}
                            </p>
                          </div>
                        )}

                        {outcomeList.length > 0 && (
                          <div>
                            <h4 className="font-body text-[11px] font-medium uppercase tracking-[0.16em] text-muted mb-1.5">
                              Key Outcomes
                            </h4>
                            <ul className="space-y-1">
                              {outcomeList.map((item, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 font-body text-sm text-ink/85"
                                >
                                  <span
                                    aria-hidden="true"
                                    className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0"
                                  />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>

                      {/* Technologies Used */}
                      {project.tech && project.tech.length > 0 && (
                        <motion.div variants={infoItemVariants} className="pt-1">
                          <h4 className="font-body text-[11px] font-medium uppercase tracking-[0.16em] text-muted mb-2">
                            Technologies Used
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {project.tech.map((tech, i) => (
                              <span
                                key={i}
                                className="rounded-full bg-surface-subtle border border-border-subtle px-2.5 py-1 font-body text-xs text-ink/85"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {(liveDemoUrl || githubUrl) && (
                      <motion.div
                        variants={infoItemVariants}
                        className="flex flex-wrap gap-3 pt-4 border-t border-border-subtle"
                      >
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
                            className="group inline-flex items-center justify-center gap-2 rounded-full bg-ink text-canvas hover:bg-primary hover:text-[#171719] hover:-translate-y-0.5 px-6 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                          >
                            <span>Live Demo</span>
                            <FaExternalLinkAlt
                              aria-hidden="true"
                              className="text-[11px] transition-transform duration-200 group-hover:translate-x-0.5"
                            />
                          </a>
                        )}
                        {githubUrl && (
                          <a
                            href={githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-border-strong px-6 py-2.5 text-xs sm:text-sm font-medium text-ink hover:bg-surface-subtle hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                          >
                            <FaGithub aria-hidden="true" />
                            <span>Source Code</span>
                          </a>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                </Card>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Minimalist Horizontal Segmented Progress Indicator */}
          {projects.length > 1 && (
            <motion.div
              variants={revealBlock(0.44)}
              initial={reduceMotion ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="flex items-center justify-center pt-1"
            >
              <div
                className="flex items-center gap-2 w-full max-w-xs"
                role="group"
                aria-label="Project progress"
              >
                {projects.map((item, idx) => {
                  const isCurrent = idx === carouselIndex;
                  return (
                    <button
                      type="button"
                      key={item.id || idx}
                      onClick={() => {
                        if (idx === carouselIndex) return;
                        const newDirection = idx > carouselIndex ? 1 : -1;
                        setPage([idx, newDirection]);
                      }}
                      aria-label={`Go to project ${idx + 1}: ${item.title}`}
                      aria-current={isCurrent ? 'step' : undefined}
                      className="relative flex-1 py-2 cursor-pointer group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded"
                    >
                      <span className="relative block h-1 w-full rounded-full bg-border-subtle group-hover:bg-border-strong transition-colors overflow-hidden">
                        {isCurrent && (
                          <motion.span
                            layoutId="projects-active-progress"
                            transition={{
                              duration: reduceMotion ? 0 : 0.45,
                              ease: EDITORIAL_EASE,
                            }}
                            className="absolute inset-0 rounded-full bg-primary"
                          />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <Lightbox lightboxData={lightboxData} setLightboxData={setLightboxData} />
    </section>
  );
};
