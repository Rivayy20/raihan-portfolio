import { useId, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FaGraduationCap, FaChevronDown } from 'react-icons/fa';
import { Card } from '../ui/Card';
import { SpiderIcon } from '../ui/SpiderManElements';
import { isSpiderManPreset } from '../../constants/colorPresets';
import { ExperiencePanel } from './ExperiencePanel';
import { CertificationsSection } from './CertificationsSection';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { EDITORIAL_EASE } from '../../utils/motionVariants';

const DEFAULT_NARRATIVE_HIGHLIGHTS = [
  'Telkom University',
  'Information Systems',
  'Software Engineering',
  'Game Developer Intern',
  'Unity',
  'Blender',
  'React',
  'Laravel',
  'PHP',
  'MySQL',
];

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renderHighlightedParagraph(text, highlights = []) {
  const cleanHighlights = (highlights || [])
    .map((h) => String(h || '').trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if (!cleanHighlights.length) return text;

  const pattern = new RegExp(`(${cleanHighlights.map(escapeRegExp).join('|')})`, 'gi');
  const parts = String(text || '').split(pattern);

  return parts.map((part, idx) => {
    const matched = cleanHighlights.some(
      (phrase) => phrase.toLowerCase() === part.toLowerCase()
    );
    if (!matched) return part;
    return (
      <mark
        key={idx}
        className="rounded-sm bg-primary/12 dark:bg-primary/20 px-1.5 py-0.5 text-ink font-medium"
      >
        {part}
      </mark>
    );
  });
}

const EducationCard = ({ about, education, isExpanded, onToggle }) => {
  const reduceMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const { t } = useLanguage();
  const timelineAnimation = resolvedTheme?.config?.effects?.timelineAnimation !== false;
  const currentItems = education.filter((item) => item.educationLevel === 'current');
  const previousItems = education.filter((item) => item.educationLevel !== 'current');

  const primaryList = currentItems.length > 0 ? currentItems : education.slice(0, 1);
  const secondaryList =
    currentItems.length > 0 ? previousItems : education.slice(1);
  const hasExpandable =
    secondaryList.length > 0 || primaryList.some((item) => Boolean(item.description));

  const primaryFirst = primaryList[0];

  return (
    <Card className="p-6 sm:p-7 bg-surface/95 hover:-translate-y-1 hover:border-border-strong transition-all duration-300">
      <div className="flex items-start justify-between gap-4 pb-5 border-b border-border-subtle">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-primary/12 border border-primary/25 flex items-center justify-center text-base text-primary overflow-hidden shrink-0">
            {primaryFirst?.logoUrl ? (
              <img
                src={primaryFirst.logoUrl}
                alt={primaryFirst.institution}
                loading="lazy"
                decoding="async"
                className="w-7 h-7 object-contain"
              />
            ) : (
              <FaGraduationCap aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
              {t('about.academicBackground', 'Academic Background')}
            </p>
            <h3 className="font-heading text-lg sm:text-xl font-medium text-ink">
              {about?.educationCardTitle || 'Education'}
            </h3>
          </div>
        </div>

        {currentItems.length > 0 && (
          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-primary/12 border border-primary/25 px-2.5 py-1 font-body text-[11px] font-medium text-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            {t('about.active', 'Active')}
          </span>
        )}
      </div>

      <div className="relative pt-5 pl-5 space-y-3">
        <span
          aria-hidden="true"
          className="absolute left-1.5 top-7 bottom-4 w-px rounded-full"
          style={{
            backgroundColor: timelineAnimation
              ? 'var(--color-web-line)'
              : 'var(--color-border-subtle)',
          }}
        />
        {primaryList.map((edu, idx) => (
          <div
            key={edu.id || idx}
            className="relative rounded-2xl bg-canvas/75 dark:bg-canvas/60 border border-border-subtle p-4 sm:p-5"
          >
            <span
              aria-hidden="true"
              className="absolute -left-5 top-5.5 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/15"
              style={
                timelineAnimation
                  ? { boxShadow: '0 0 12px var(--color-spider-sense-glow)' }
                  : undefined
              }
            />
            {(edu.degree || edu.major) && (
              <p className="font-heading text-base sm:text-lg font-medium text-ink leading-snug">
                {edu.degree || edu.major}
              </p>
            )}
            <p className="font-body text-sm font-medium text-ink/80 mt-1.5">
              {edu.institution}
            </p>
            {edu.period && (
              <p className="font-body text-xs font-medium text-muted mt-1">
                {edu.period}
              </p>
            )}
          </div>
        ))}
      </div>

      {hasExpandable && (
        <div className="mt-5 pt-4 border-t border-border-subtle">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isExpanded}
            className="w-full flex items-center justify-between py-1 rounded-lg text-xs font-medium uppercase tracking-[0.14em] text-muted hover:text-ink transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span>
              {isExpanded
                ? t('about.hidePreviousEdu', 'Hide Previous Education')
                : about?.previousEduHeading || 'Previous Education'}
            </span>
            <FaChevronDown
              aria-hidden="true"
              className={`text-[11px] transition-transform duration-300 ${
                isExpanded ? 'rotate-180 text-primary' : ''
              }`}
            />
          </button>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.28,
                  ease: EDITORIAL_EASE,
                }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-4">
                  {primaryList.some((e) => Boolean(e.description)) && (
                    <div className="space-y-2">
                      {primaryList.map(
                        (e) =>
                          e.description && (
                            <p
                              key={e.id}
                              className="text-sm text-muted leading-relaxed"
                            >
                              {e.description}
                            </p>
                          )
                      )}
                    </div>
                  )}

                  {secondaryList.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="flex items-start gap-3 border-l-2 border-primary/40 pl-3.5"
                    >
                      {item.logoUrl && (
                        <img
                          src={item.logoUrl}
                          alt={item.institution}
                          loading="lazy"
                          decoding="async"
                          className="w-7 h-7 object-contain bg-white border border-border-subtle rounded-md p-0.5 shrink-0 mt-0.5"
                        />
                      )}
                      <div>
                        <p className="font-heading text-sm font-medium text-ink">
                          {item.institution}
                        </p>
                        {(item.degree || item.major) && (
                          <p className="font-body text-xs text-muted mt-0.5">
                            {item.degree
                              ? `${item.degree}${item.major ? ` — ${item.major}` : ''}`
                              : `${t('about.majorPrefix', 'Major:')} ${item.major}`}
                          </p>
                        )}
                        {item.period && (
                          <p className="font-body text-xs text-muted/80 mt-0.5">
                            {item.period}
                          </p>
                        )}
                        {item.description && (
                          <p className="font-body text-xs text-muted mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </Card>
  );
};

export const AboutSection = ({ sectionConfig }) => {
  const { data } = usePortfolioData();
  const { resolvedTheme } = useTheme();
  const { t } = useLanguage();
  const { about, education, experiences, certifications, settings } = data;
  const isSpiderMan = isSpiderManPreset(settings?.colorPreset);
  const viewportOnce = resolvedTheme?.config?.animation?.replayOnScroll === false;
  const [expandedCard, setExpandedCard] = useState(null);
  const experiencePanelId = useId();
  const reduceMotion = useReducedMotion();

  const handleToggle = (cardId) => {
    setExpandedCard((prev) => (prev === cardId ? null : cardId));
  };

  const isCentered = sectionConfig?.contentAlignment === 'center';
  const sectionTitle = sectionConfig?.title || 'About Me';
  const sectionSubtitle =
    sectionConfig?.subtitle ||
    'Combining logic with creativity to build memorable digital solutions.';

  const showNarrative =
    about?.showNarrative !== false && (about?.narrativeParagraphs || []).length > 0;
  const showEdu = about?.showEducationCard !== false && education.length > 0;
  const showExp = about?.showExperienceCard !== false && experiences.length > 0;
  const showCerts = about?.showCertifications !== false && certifications.length > 0;

  const activeHighlights =
    (about?.narrativeHighlights || []).length > 0
      ? about.narrativeHighlights
      : DEFAULT_NARRATIVE_HIGHLIGHTS;

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

  const narrativeContainerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.11,
        delayChildren: reduceMotion ? 0 : 0.08,
      },
    },
  };

  const narrativeItemVariants = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0.2 : 0.78, ease: EDITORIAL_EASE },
    },
  };

  const eduCardVariants = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: reduceMotion ? 0.2 : 0.85,
        delay: reduceMotion ? 0 : 0.18,
        ease: EDITORIAL_EASE,
      },
    },
  };

  return (
    <section
      id="about"
      className="py-20 sm:py-28 md:py-32 scroll-mt-24"
    >
      <div className="flex flex-col gap-12 sm:gap-16">
        {/* Staggered Section Header */}
        <motion.div
          variants={headerContainerVariants}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: viewportOnce, amount: 0.2 }}
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
            {isSpiderMan ? (
              <SpiderIcon className="w-3.5 h-3.5 text-primary shrink-0" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            )}
            {t('about.eyebrow', '01 / About')}
          </motion.span>

          <motion.h2
            variants={headingVariants}
            className="font-heading text-3xl sm:text-4xl md:text-5xl font-medium tracking-[-0.03em] leading-[1.08] text-ink"
          >
            {sectionTitle}
          </motion.h2>

          {sectionSubtitle && (
            <motion.p
              variants={subtitleVariants}
              className="font-body text-base sm:text-lg text-muted leading-relaxed"
            >
              {sectionSubtitle}
            </motion.p>
          )}
        </motion.div>

        <div className="flex flex-col gap-16 sm:gap-20">
          {/* Part 1: Balanced Two-Column Editorial Split (~60% Narrative / ~40% Education) */}
          {(showNarrative || showEdu) && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              {showNarrative && (
                <motion.div
                  variants={narrativeContainerVariants}
                  initial={reduceMotion ? false : 'hidden'}
                  whileInView="visible"
                  viewport={{ once: viewportOnce, amount: 0.15 }}
                  className={showEdu ? 'lg:col-span-7 max-w-[65ch]' : 'lg:col-span-12 max-w-[72ch]'}
                >
                  <motion.div
                    variants={narrativeItemVariants}
                    className="flex items-center gap-3 mb-5"
                  >
                    <span className="w-6 h-0.5 rounded-full bg-primary" aria-hidden="true" />
                    <h3 className="font-heading text-xl sm:text-2xl font-medium text-ink">
                      {about?.narrativeTitle || 'The Narrative'}
                    </h3>
                  </motion.div>

                  <div className="space-y-5 font-body leading-[1.82]">
                    {(about?.narrativeParagraphs || []).map((paragraph, idx) => (
                      <motion.p
                        key={idx}
                        variants={narrativeItemVariants}
                        className={
                          idx === 0
                            ? 'text-[17px] sm:text-lg text-ink/95'
                            : 'text-[15px] sm:text-base text-muted'
                        }
                      >
                        {renderHighlightedParagraph(paragraph, activeHighlights)}
                      </motion.p>
                    ))}
                  </div>
                </motion.div>
              )}

              {showEdu && (
                <motion.div
                  variants={eduCardVariants}
                  initial={reduceMotion ? false : 'hidden'}
                  whileInView="visible"
                  viewport={{ once: viewportOnce, amount: 0.2 }}
                  className={showNarrative ? 'lg:col-span-5' : 'lg:col-span-12 max-w-xl'}
                >
                  <EducationCard
                    about={about}
                    education={education}
                    isExpanded={expandedCard === 'edu'}
                    onToggle={() => handleToggle('edu')}
                  />
                </motion.div>
              )}
            </div>
          )}

          {/* Part 2: Animated Vertical Career Timeline */}
          {showExp && <ExperiencePanel id={experiencePanelId} isOpen />}

          {/* Part 3: Bento Certifications Grid */}
          {showCerts && (
            <div className="pt-12 border-t border-border-subtle">
              <CertificationsSection
                expandedId={expandedCard}
                onToggle={handleToggle}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
