import { useId, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { FaBriefcase } from 'react-icons/fa';
import { Card } from '../ui/Card';
import { Chevron, Collapse } from '../ui/Collapse';
import { OrgLogo } from '../ui/OrgLogo';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { EDITORIAL_EASE } from '../../utils/motionVariants';

const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

const TYPE_LABELS = {
  internship: {
    labelKey: 'about.badgeInternship',
    label: 'Internship',
    badgeClass: 'bg-secondary/15 text-ink border-secondary/35',
  },
  academic: {
    labelKey: 'about.badgeAcademic',
    label: 'Academic',
    badgeClass: 'bg-surface-subtle text-muted border-border-subtle',
  },
  organization: {
    labelKey: 'about.badgeOrganization',
    label: 'Organization',
    badgeClass: 'bg-surface-subtle text-muted border-border-subtle',
  },
  full_time: {
    labelKey: 'about.badgeFullTime',
    label: 'Full-Time',
    badgeClass: 'bg-primary/15 text-ink border-primary/35',
  },
  part_time: {
    labelKey: 'about.badgePartTime',
    label: 'Part-Time',
    badgeClass: 'bg-primary/15 text-ink border-primary/35',
  },
  freelance: {
    labelKey: 'about.badgeFreelance',
    label: 'Freelance',
    badgeClass: 'bg-accent/20 text-ink border-accent/40',
  },
};

const getBadge = ({ status, isCurrent, type }) => {
  if (status === 'current' || isCurrent) {
    return {
      labelKey: 'about.badgeCurrent',
      label: 'Current',
      badgeClass: 'bg-primary/15 text-ink border-primary/35',
      isCurrentDot: true,
    };
  }
  return TYPE_LABELS[type] || null;
};

const Facts = ({ facts }) => (
  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 rounded-xl bg-canvas/60 p-4 border border-border-subtle">
    {facts.map(({ label, value }, idx) => (
      <div key={`${label}-${idx}`}>
        <dt className="font-body text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          {label}
        </dt>
        <dd className="font-body text-sm font-medium text-ink mt-0.5">{value}</dd>
      </div>
    ))}
  </dl>
);

const BulletList = ({ items }) => (
  <ul className="space-y-2 text-sm text-ink/85">
    {items.map((item, idx) => {
      const { label, text } = typeof item === 'string' ? { text: item } : item;
      return (
        <li key={`${label || text}-${idx}`} className="flex items-start gap-2.5">
          <span
            aria-hidden="true"
            className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0"
          />
          <span className="leading-relaxed">
            {label && <strong className="font-semibold text-ink">{label}: </strong>}
            {text}
          </span>
        </li>
      );
    })}
  </ul>
);

const Chips = ({ items }) => (
  <ul className="flex flex-wrap gap-2">
    {items.map((item, idx) => (
      <li
        key={`${item}-${idx}`}
        className="rounded-full border border-border-subtle bg-canvas/70 px-3 py-1 text-xs font-medium text-ink/85"
      >
        {item}
      </li>
    ))}
  </ul>
);

const DetailSection = ({ title, text, facts, items, chips, note }) => (
  <section className="flex flex-col gap-2.5">
    <h5 className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-muted">
      {title}
    </h5>
    {text && <p className="font-body text-sm text-ink/85 leading-relaxed">{text}</p>}
    {facts?.length > 0 && <Facts facts={facts} />}
    {items?.length > 0 && <BulletList items={items} />}
    {chips?.length > 0 && <Chips items={chips} />}
    {note && <p className="font-body text-xs italic text-muted">{note}</p>}
  </section>
);

const ExperienceDetails = ({ experience }) => {
  const { t } = useLanguage();
  const hasCustomSections = (experience.sections || []).length > 0;

  return (
    <div className="pt-5 mt-5 border-t border-border-subtle flex flex-col gap-5">
      {hasCustomSections ? (
        experience.sections.map((section, idx) => (
          <DetailSection key={section.id || `${section.title}-${idx}`} {...section} />
        ))
      ) : (
        <>
          {(experience.detailedDescription || experience.summary) && (
            <DetailSection
              title={t('about.overview', 'Overview')}
              text={experience.detailedDescription || experience.summary}
            />
          )}
          {experience.responsibilities?.length > 0 && (
            <DetailSection
              title={t('about.responsibilities', 'Responsibilities')}
              items={experience.responsibilities}
            />
          )}
          {experience.relevantSkills?.length > 0 && (
            <DetailSection
              title={t('about.relevantSkills', 'Relevant Skills')}
              chips={experience.relevantSkills}
            />
          )}
        </>
      )}
    </div>
  );
};

const ExperienceItem = ({
  experience,
  index,
  isOpen,
  onToggle,
  timelineAnimation = true,
  viewportOnce = false,
}) => {
  const detailsId = useId();
  const reduceMotion = useReducedMotion();
  const { t } = useLanguage();
  const {
    position,
    organization,
    institution,
    division,
    duration,
    period,
    summary,
    logo,
    logoAlt,
    status,
    isCurrent,
  } = experience;

  const badge = getBadge(experience);
  const timeframe = [period, duration].filter(Boolean).join(' · ');
  const isActive = status === 'current' || Boolean(isCurrent);
  const overviewSnippet = summary || experience.sections?.[0]?.text || '';

  return (
    <motion.li
      initial={reduceMotion ? false : { opacity: 0, y: 18, x: 10 }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: viewportOnce, amount: 0.18 }}
      transition={{
        duration: reduceMotion ? 0.2 : 0.78,
        delay: reduceMotion ? 0 : index * 0.12,
        ease: EDITORIAL_EASE,
      }}
      className="relative group/item"
    >
      {/* Timeline Node centered directly on vertical rail */}
      <motion.span
        aria-hidden="true"
        initial={reduceMotion ? false : { scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: viewportOnce, amount: 0.2 }}
        transition={{
          duration: reduceMotion ? 0.15 : 0.45,
          delay: reduceMotion ? 0 : index * 0.12 + 0.08,
          ease: EDITORIAL_EASE,
        }}
        className="absolute -left-8 sm:-left-12 top-8 w-6 sm:w-8 flex items-center justify-center z-10"
      >
        {isActive ? (
          <span
            className={`relative w-3.5 h-3.5 rounded-full bg-primary ring-4 ring-primary/20 transition-transform duration-300 group-hover/item:scale-125 ${
              timelineAnimation && !reduceMotion ? 'animate-pulse' : ''
            }`}
            style={{ boxShadow: '0 0 18px var(--color-spider-sense-glow)' }}
          />
        ) : (
          <span
            className="w-3 h-3 rounded-full bg-canvas border-2 border-border-strong transition-all duration-300 group-hover/item:border-primary group-hover/item:bg-primary/20 group-hover/item:scale-125"
            style={
              isOpen
                ? {
                    borderColor: 'var(--color-primary)',
                    boxShadow: '0 0 12px var(--color-web-glow)',
                  }
                : undefined
            }
          />
        )}
      </motion.span>

      {/* Subtle horizontal tick connecting node perimeter to card edge */}
      <span
        aria-hidden="true"
        className="hidden sm:block absolute -left-5 top-9.5 w-5 h-px transition-colors duration-300 group-hover/item:bg-primary"
        style={{ backgroundColor: 'var(--color-web-line)' }}
      />

      <Card
        className={`p-5 sm:p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-border-strong ${
          isOpen ? 'border-primary/45' : ''
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <OrgLogo
              key={`${experience.id}-${logo || 'fallback'}`}
              src={logo}
              alt={logoAlt}
              className="w-12 h-12 sm:w-13 sm:h-13"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h4 className="font-heading text-base sm:text-lg font-medium text-ink leading-snug">
                  {position}
                </h4>
                {badge && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${badge.badgeClass}`}
                  >
                    {badge.isCurrentDot && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                    {t(badge.labelKey, badge.label)}
                  </span>
                )}
              </div>

              <p className="font-body text-sm font-medium text-ink/85">
                {organization}
                {institution ? ` — ${institution}` : ''}
                {division ? ` (${division})` : ''}
              </p>

              {timeframe && (
                <p className="font-body text-xs text-muted mt-1">{timeframe}</p>
              )}

              {overviewSnippet && (
                <p className="font-body text-sm text-muted mt-2.5 leading-relaxed">
                  {overviewSnippet}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            aria-controls={detailsId}
            className={`shrink-0 inline-flex items-center justify-center gap-2 rounded-full border border-border-strong bg-transparent hover:bg-primary/10 hover:border-primary/45 px-4 py-2 font-body text-xs font-medium text-ink cursor-pointer transition-all duration-300 ${FOCUS_RING}`}
          >
            <span>
              {isOpen
                ? t('about.hideDetails', 'Hide Details')
                : t('about.viewDetails', 'View Details')}
            </span>
            <Chevron isOpen={isOpen} />
          </button>
        </div>

        <Collapse show={isOpen} id={detailsId}>
          <ExperienceDetails experience={experience} />
        </Collapse>
      </Card>
    </motion.li>
  );
};

export const ExperiencePanel = ({ id, isOpen = true }) => {
  const { data } = usePortfolioData();
  const { resolvedTheme } = useTheme();
  const { about, experiences } = data;
  const [openId, setOpenId] = useState(null);
  const timelineRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const timelineAnimation = resolvedTheme?.config?.effects?.timelineAnimation !== false;
  const viewportOnce = resolvedTheme?.config?.animation?.replayOnScroll === false;

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 78%', 'end 68%'],
  });
  const lineScaleY = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  if (!isOpen || !experiences.length) return null;

  return (
    <div id={id} className="experience-details-panel pt-12 border-t border-border-subtle">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: viewportOnce, amount: 0.2 }}
        transition={{ duration: reduceMotion ? 0.2 : 0.75, ease: EDITORIAL_EASE }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-9"
      >
        <div className="flex items-center gap-3.5">
          <span className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-base text-ink shrink-0">
            <FaBriefcase aria-hidden="true" />
          </span>
          <div>
            <p className="font-body text-xs font-medium uppercase tracking-[0.18em] text-muted">
              {about?.experienceCardSubtitle || 'Academic & Industry Experience'}
            </p>
            <h3 className="font-heading text-2xl sm:text-3xl font-medium text-ink">
              {about?.experienceCardTitle || 'Experience'}
            </h3>
          </div>
        </div>
      </motion.div>

      <div ref={timelineRef} className="relative pl-8 sm:pl-12">
        {/* Web-inspired theme-aware spine */}
        <span
          aria-hidden="true"
          className="absolute left-3 sm:left-4 top-3 bottom-3 w-px"
          style={{
            backgroundColor: timelineAnimation ? 'var(--color-web-line)' : undefined,
          }}
        />

        {/* Scroll-linked animated gradient progress rail */}
        <motion.div
          aria-hidden="true"
          style={{ scaleY: reduceMotion || !timelineAnimation ? 1 : lineScaleY }}
          className="origin-top absolute left-3 sm:left-4 top-3 bottom-3 w-0.5 -ml-px rounded-full sunset-gradient-line"
        />

        <ol className="flex flex-col gap-6 sm:gap-7">
          {experiences.map((experience, idx) => (
            <ExperienceItem
              key={experience.id}
              index={idx}
              experience={experience}
              timelineAnimation={timelineAnimation}
              viewportOnce={viewportOnce}
              isOpen={openId === experience.id}
              onToggle={() =>
                setOpenId((prev) => (prev === experience.id ? null : experience.id))
              }
            />
          ))}
        </ol>
      </div>
    </div>
  );
};
