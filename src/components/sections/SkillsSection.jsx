import { createElement, useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';
import { getSkillIconComponent } from '../../constants/iconRegistry';
import { getSkillCategoryColor } from '../../constants/colorPresets';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { EDITORIAL_EASE } from '../../utils/motionVariants';

const MARQUEE_DURATIONS = [28, 24, 32, 26];

const SkillBadge = ({
  skill,
  type,
  isSelected = false,
  isDuplicate = false,
  onHoverStart,
  onHoverEnd,
  onSelect,
}) => {
  const iconComponent =
    skill.iconType !== 'none' && skill.iconType !== 'media' && skill.icon
      ? getSkillIconComponent(skill.icon)
      : null;

  const isExploring = type === 'exploring';
  const isPrimary = type === 'primary';

  const pillStyleClass = isPrimary
    ? 'bg-surface-subtle text-ink border-border-strong/60 hover:border-primary/70'
    : isExploring
      ? 'bg-lavender/10 text-ink border-lavender/35 hover:border-lavender/75'
      : 'bg-surface/75 text-ink/85 border-border-subtle hover:border-primary/65 hover:text-ink';

  return (
    <button
      type="button"
      tabIndex={isDuplicate ? -1 : 0}
      aria-hidden={isDuplicate ? true : undefined}
      onMouseEnter={() => onHoverStart(skill)}
      onMouseLeave={onHoverEnd}
      onFocus={() => {
        if (!isDuplicate) onHoverStart(skill);
      }}
      onBlur={onHoverEnd}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(skill);
      }}
      className={`shrink-0 flex items-center gap-2 rounded-full border px-3.5 py-2 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${pillStyleClass} ${
        isSelected ? 'border-primary/80 shadow-sm' : ''
      }`}
    >
      {skill.iconType === 'media' && skill.iconUrl ? (
        <img
          src={skill.iconUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-4 h-4 object-contain shrink-0"
        />
      ) : (
        iconComponent &&
        createElement(iconComponent, {
          'aria-hidden': true,
          className: `shrink-0 ${isPrimary ? 'text-base text-primary' : 'text-sm text-muted'}`,
        })
      )}

      <span
        className={`font-body whitespace-nowrap ${
          isPrimary ? 'text-sm font-medium' : 'text-xs font-medium'
        }`}
      >
        {skill.name}
      </span>

      {isExploring && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-lavender shrink-0"
          title="Currently Exploring"
        />
      )}
    </button>
  );
};

const CategoryMarqueeCard = ({
  category,
  idx,
  reduceMotion,
  selectedSkillKey,
  onSelectSkill,
}) => {
  const [hoveredSkill, setHoveredSkill] = useState(null);

  const categoryTint = getSkillCategoryColor(category.colorPreset);

  const skills = useMemo(() => {
    const idPrefix = category.id || category.slug || idx;
    return [
      ...(category.primary || []).map((skill, i) => ({
        ...skill,
        tier: 'primary',
        keyBase: skill.id || `${idPrefix}-p-${skill.name}-${i}`,
      })),
      ...(category.supporting || []).map((skill, i) => ({
        ...skill,
        tier: 'supporting',
        keyBase: skill.id || `${idPrefix}-s-${skill.name}-${i}`,
      })),
      ...(category.exploring || []).map((skill, i) => ({
        ...skill,
        tier: 'exploring',
        keyBase: skill.id || `${idPrefix}-e-${skill.name}-${i}`,
      })),
    ];
  }, [category, idx]);

  const repeatCount = useMemo(
    () => (skills.length > 0 ? Math.max(1, Math.ceil(10 / skills.length)) : 1),
    [skills.length]
  );

  const selectedInCategory = useMemo(
    () => skills.find((s) => s.keyBase === selectedSkillKey) || null,
    [skills, selectedSkillKey]
  );

  const inspectedSkill = hoveredSkill || selectedInCategory;
  const isPaused = Boolean(hoveredSkill || selectedInCategory);
  const directionClass =
    idx % 2 === 0 ? 'skills-marquee-left' : 'skills-marquee-right';
  const durationSeconds = MARQUEE_DURATIONS[idx % MARQUEE_DURATIONS.length];

  const tierSummary = useMemo(() => {
    const parts = [];
    if ((category.primary || []).length > 0) parts.push('Primary Stack');
    if ((category.supporting || []).length > 0) parts.push('Supporting');
    if ((category.exploring || []).length > 0) {
      parts.push(category.learningLabel || 'Exploring');
    }
    return parts.join(' · ');
  }, [category]);

  const itemVariants = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0.2 : 0.65,
        delay: reduceMotion ? 0 : idx * 0.08,
        ease: EDITORIAL_EASE,
      },
    },
  };

  return (
    <motion.div
      initial={reduceMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={itemVariants}
      className="h-full min-w-0"
    >
      <Card
        className={`h-full min-w-0 flex flex-col justify-between gap-5 p-6 sm:p-7 hover:border-border-strong ${categoryTint}`}
      >
        <div className="pb-4 border-b border-border-subtle flex items-center justify-between gap-3">
          <h3 className="font-heading text-xl font-medium text-ink truncate">
            {category.category}
          </h3>
          <span className="font-body text-xs text-muted shrink-0">
            {skills.length} skills
          </span>
        </div>

        {/* Seamless Infinite Marquee (or wrapped static grid when reduced motion is enabled) */}
        {reduceMotion ? (
          <div className="flex flex-wrap gap-2 py-1">
            {skills.map((skill) => (
              <SkillBadge
                key={skill.keyBase}
                skill={skill}
                type={skill.tier}
                isSelected={selectedSkillKey === skill.keyBase}
                onHoverStart={setHoveredSkill}
                onHoverEnd={() => setHoveredSkill(null)}
                onSelect={onSelectSkill}
              />
            ))}
          </div>
        ) : (
          <div
            data-paused={isPaused ? 'true' : 'false'}
            className="skills-marquee skills-marquee-mask relative w-full overflow-hidden py-2.5"
          >
            <div
              className={`skills-marquee-track ${directionClass}`}
              style={{ '--marquee-duration': `${durationSeconds}s` }}
            >
              {[0, 1].map((copyIdx) => (
                <div
                  key={copyIdx}
                  aria-hidden={copyIdx === 1 ? true : undefined}
                  className="flex items-center shrink-0"
                >
                  {Array.from({ length: repeatCount }).map((_, repeatIdx) => {
                    const isCanonicalPass = copyIdx === 0 && repeatIdx === 0;
                    return (
                      <div
                        key={repeatIdx}
                        aria-hidden={!isCanonicalPass ? true : undefined}
                        className="flex items-center gap-2.5 pr-2.5 shrink-0"
                      >
                        {skills.map((skill) => (
                          <SkillBadge
                            key={`${copyIdx}-${repeatIdx}-${skill.keyBase}`}
                            skill={skill}
                            type={skill.tier}
                            isSelected={selectedSkillKey === skill.keyBase}
                            isDuplicate={!isCanonicalPass}
                            onHoverStart={setHoveredSkill}
                            onHoverEnd={() => setHoveredSkill(null)}
                            onSelect={onSelectSkill}
                          />
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quiet Applied-In Detail Bar (stays clean without overflow clipping) */}
        <div className="pt-3 border-t border-border-subtle min-h-7 flex items-center justify-between gap-3">
          {inspectedSkill ? (
            <p className="font-body text-xs text-muted truncate">
              <span className="font-medium text-ink">{inspectedSkill.name}</span>
              {Array.isArray(inspectedSkill.projects) &&
              inspectedSkill.projects.length > 0 ? (
                <span>
                  {' '}
                  · Applied in{' '}
                  <span className="text-ink/85">
                    {inspectedSkill.projects.join(', ')}
                  </span>
                </span>
              ) : (
                <span> · Core stack & ongoing learning</span>
              )}
            </p>
          ) : (
            <p className="font-body text-[11px] uppercase tracking-[0.16em] text-muted/80 truncate">
              {tierSummary}
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export const SkillsSection = ({ sectionConfig }) => {
  const { data } = usePortfolioData();
  const { expertise } = data;
  const [selectedSkillKey, setSelectedSkillKey] = useState(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const handleClickOutside = () => setSelectedSkillKey(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSelectSkill = (skill) => {
    setSelectedSkillKey((prev) =>
      prev === skill.keyBase ? null : skill.keyBase
    );
  };

  return (
    <Section
      id="expertise"
      eyebrow="02 / Expertise"
      title={sectionConfig?.title || 'Core Expertise'}
      subtitle={
        sectionConfig?.subtitle ||
        'The tools and technologies I use to build digital experiences.'
      }
      alignment={sectionConfig?.contentAlignment || 'left'}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-7 items-stretch">
        {(expertise || []).map((category, idx) => (
          <CategoryMarqueeCard
            key={category.id || category.slug || idx}
            category={category}
            idx={idx}
            reduceMotion={reduceMotion}
            selectedSkillKey={selectedSkillKey}
            onSelectSkill={handleSelectSkill}
          />
        ))}
      </div>
    </Section>
  );
};
