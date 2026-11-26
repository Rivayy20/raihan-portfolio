import { createElement, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';
import { getSkillIconComponent } from '../../constants/iconRegistry';
import { getSkillCategoryColor } from '../../constants/colorPresets';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { EDITORIAL_EASE } from '../../utils/motionVariants';
import { SpiderIcon } from '../ui/SpiderManElements';

const MARQUEE_DURATIONS = [28, 24, 32, 26];

const SkillBadge = ({
  skill,
  type,
  isSelected = false,
  isActive = false,
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
  const highlighted = !isDuplicate && (isSelected || isActive);

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
      aria-pressed={isDuplicate ? undefined : isSelected}
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
      style={
        highlighted
          ? { boxShadow: '0 0 16px var(--color-web-glow)' }
          : undefined
      }
      className={`shrink-0 flex items-center gap-2 rounded-full border px-3.5 py-2 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${pillStyleClass} ${
        highlighted ? 'border-primary scale-105 -translate-y-0.5 shadow-sm' : ''
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
  viewportOnce = false,
  selectedSkillKey,
  onSelectSkill,
}) => {
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const { t } = useLanguage();

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
    if ((category.primary || []).length > 0) {
      parts.push(t('expertise.primaryStack', 'Primary Stack'));
    }
    if ((category.supporting || []).length > 0) {
      parts.push(t('expertise.supporting', 'Supporting'));
    }
    if ((category.exploring || []).length > 0) {
      parts.push(category.learningLabel || 'Exploring');
    }
    return parts.join(' · ');
  }, [category, t]);

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
      viewport={{ once: viewportOnce, amount: 0.15 }}
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
            {skills.length} {t('expertise.skillsUnit', 'skills')}
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
                  · {t('expertise.appliedIn', 'Applied in')}{' '}
                  <span className="text-ink/85">
                    {inspectedSkill.projects.join(', ')}
                  </span>
                </span>
              ) : (
                <span>
                  {' '}
                  · {t('expertise.coreStackNote', 'Core stack & ongoing learning')}
                </span>
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

const WebSkillNetworkCard = ({
  category,
  idx,
  reduceMotion,
  viewportOnce = false,
  selectedSkillKey,
  onSelectSkill,
  isSpiderMan = false,
}) => {
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const { t } = useLanguage();
  const arenaRef = useRef(null);
  const hubRef = useRef(null);
  const nodeElsRef = useRef(new Map());
  const [layout, setLayout] = useState({
    width: 0,
    height: 0,
    hub: { x: 0, y: 0 },
    nodes: [],
  });
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

  const selectedInCategory = useMemo(
    () => skills.find((s) => s.keyBase === selectedSkillKey) || null,
    [skills, selectedSkillKey]
  );

  const inspectedSkill = hoveredSkill || selectedInCategory;

  const splitAt = Math.ceil(skills.length / 2);
  const topGroup = skills.slice(0, splitAt);
  const bottomGroup = skills.slice(splitAt);

  const setNodeRef = useCallback((keyBase, el) => {
    const map = nodeElsRef.current;
    if (el) {
      map.set(keyBase, el);
    } else {
      map.delete(keyBase);
    }
  }, []);

  const measureNetwork = useCallback(() => {
    const arenaEl = arenaRef.current;
    const hubEl = hubRef.current;
    if (!arenaEl || !hubEl) return;

    const arenaRect = arenaEl.getBoundingClientRect();
    if (!arenaRect.width || !arenaRect.height) return;

    const hubRect = hubEl.getBoundingClientRect();
    const hub = {
      x: hubRect.left - arenaRect.left + hubRect.width / 2,
      y: hubRect.top - arenaRect.top + hubRect.height / 2,
      top: hubRect.top - arenaRect.top,
      bottom: hubRect.bottom - arenaRect.top,
    };

    const nodes = [];
    for (let i = 0; i < skills.length; i++) {
      const skill = skills[i];
      const nodeEl = nodeElsRef.current.get(skill.keyBase);
      if (!nodeEl) continue;
      const nodeRect = nodeEl.getBoundingClientRect();
      const isTop = i < splitAt;
      nodes.push({
        keyBase: skill.keyBase,
        x: nodeRect.left - arenaRect.left + nodeRect.width / 2,
        y: nodeRect.top - arenaRect.top + nodeRect.height / 2,
        anchorY: isTop
          ? nodeRect.bottom - arenaRect.top
          : nodeRect.top - arenaRect.top,
        row: isTop ? 'top' : 'bottom',
      });
    }

    setLayout({
      width: Math.round(arenaRect.width),
      height: Math.round(arenaRect.height),
      hub,
      nodes,
    });
  }, [skills, splitAt]);

  useLayoutEffect(() => {
    let cancelled = false;
    const rafId = window.requestAnimationFrame(() => {
      if (!cancelled) measureNetwork();
    });

    const arenaEl = arenaRef.current;
    let observer;
    if (arenaEl && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        if (!cancelled) measureNetwork();
      });
      observer.observe(arenaEl);
    }

    const onResize = () => {
      if (!cancelled) measureNetwork();
    };
    window.addEventListener('resize', onResize, { passive: true });
    document.fonts?.ready?.then?.(() => {
      if (!cancelled) measureNetwork();
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
      observer?.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [measureNetwork]);

  const crossWebArcs = useMemo(() => {
    if (!layout.width || layout.nodes.length < 2) return [];
    const arcs = [];
    for (const rowName of ['top', 'bottom']) {
      const rowNodes = layout.nodes
        .filter((n) => n.row === rowName)
        .sort((a, b) => a.x - b.x);
      for (let i = 0; i < rowNodes.length - 1; i++) {
        const a = rowNodes[i];
        const b = rowNodes[i + 1];
        if (Math.abs(a.y - b.y) >= 18) continue;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const cx = mx + (layout.hub.x - mx) * 0.14;
        const cy = my + (layout.hub.y - my) * 0.3;
        arcs.push({
          id: `${rowName}-${i}`,
          d: `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`,
          active:
            inspectedSkill?.keyBase === a.keyBase ||
            inspectedSkill?.keyBase === b.keyBase,
        });
      }
    }
    return arcs;
  }, [layout, inspectedSkill?.keyBase]);

  const radialConnections = useMemo(() => {
    if (!layout.width || !layout.nodes.length) return [];
    return layout.nodes.map((node, i) => {
      const startX = layout.hub.x;
      const startY = node.row === 'top' ? layout.hub.top : layout.hub.bottom;
      const endX = node.x;
      const endY = node.anchorY;
      const midY = (startY + endY) / 2;
      const ctrlX = startX + (endX - startX) * 0.25;
      const ctrlY = midY;
      const pMidX = 0.25 * startX + 0.5 * ctrlX + 0.25 * endX;
      const pMidY = 0.25 * startY + 0.5 * ctrlY + 0.25 * endY;

      return {
        keyBase: node.keyBase,
        idx: i,
        startX,
        startY,
        pMidX,
        pMidY,
        endX,
        endY,
        d: `M ${startX.toFixed(1)} ${startY.toFixed(1)} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`,
      };
    });
  }, [layout]);

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

  const innerRingR = Math.max(44, Math.round(Math.min(layout.width, layout.height) * 0.28));
  const outerRingR = Math.max(80, Math.round(Math.min(layout.width, layout.height) * 0.48));

  return (
    <motion.div
      initial={reduceMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: viewportOnce, amount: 0.15 }}
      variants={itemVariants}
      className="h-full min-w-0"
    >
      <Card
        className={`relative h-full min-w-0 overflow-hidden flex flex-col justify-between gap-5 p-6 sm:p-7 hover:border-primary/50 ${categoryTint}`}
      >
        <div className="relative z-10 pb-3.5 border-b border-border-subtle flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              aria-hidden="true"
              className="w-2.5 h-2.5 rounded-full bg-primary shrink-0"
              style={{ boxShadow: '0 0 12px var(--color-spider-sense-glow)' }}
            />
            <h3 className="font-heading text-xl font-medium text-ink truncate">
              {category.category}
            </h3>
          </div>
          <span className="font-body text-xs text-muted shrink-0">
            {skills.length} {t('expertise.nodesUnit', 'nodes')}
          </span>
        </div>

        {/* Interactive Radial Web Connector Canvas with Edge-Anchored Paths */}
        <div
          ref={arenaRef}
          className="relative flex-1 min-h-56 flex flex-col justify-between gap-8 py-4"
        >
          {layout.width > 0 && layout.height > 0 && (
            <svg
              viewBox={`0 0 ${layout.width} ${layout.height}`}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 w-full h-full z-0"
            >
              {/* Concentric subtle web rings centered on hub */}
              <circle
                cx={layout.hub.x}
                cy={layout.hub.y}
                r={innerRingR}
                fill="none"
                stroke="var(--color-web-line)"
                strokeWidth="0.9"
                strokeDasharray="3 3"
                strokeOpacity="0.45"
              />
              <circle
                cx={layout.hub.x}
                cy={layout.hub.y}
                r={outerRingR}
                fill="none"
                stroke="var(--color-web-line)"
                strokeWidth="0.85"
                strokeOpacity="0.35"
              />

              {/* Curved cobweb cross-threads between adjacent same-row nodes */}
              {crossWebArcs.map((arc) => (
                <path
                  key={arc.id}
                  d={arc.d}
                  fill="none"
                  stroke={
                    arc.active
                      ? 'var(--color-electric-blue)'
                      : 'var(--color-web-line)'
                  }
                  strokeWidth={arc.active ? '1.25' : '0.8'}
                  strokeOpacity={arc.active ? '0.75' : '0.45'}
                />
              ))}

              {/* Animated radial Bezier paths connecting hub edge to each node edge */}
              {radialConnections.map((conn) => {
                const isActive = inspectedSkill?.keyBase === conn.keyBase;
                return (
                  <g key={conn.keyBase}>
                    <motion.path
                      d={conn.d}
                      fill="none"
                      stroke={
                        isActive
                          ? 'var(--color-spider-red)'
                          : 'var(--color-web-line)'
                      }
                      strokeWidth={isActive ? '2.1' : '1.05'}
                      strokeLinecap="round"
                      initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 1 }}
                      viewport={{ once: viewportOnce, amount: 0.2 }}
                      transition={{
                        pathLength: {
                          duration: reduceMotion ? 0.15 : 0.55,
                          delay: reduceMotion ? 0 : 0.08 + conn.idx * 0.04,
                          ease: EDITORIAL_EASE,
                        },
                        opacity: { duration: 0.2 },
                      }}
                      style={
                        isActive
                          ? { filter: 'drop-shadow(0 0 8px var(--color-web-glow))' }
                          : undefined
                      }
                    />
                    {isActive && !reduceMotion && (
                      <motion.circle
                        r="2.8"
                        fill="var(--color-spider-red)"
                        initial={{ cx: conn.startX, cy: conn.startY, opacity: 0 }}
                        animate={{
                          cx: [conn.startX, conn.pMidX, conn.endX],
                          cy: [conn.startY, conn.pMidY, conn.endY],
                          opacity: [0.2, 1, 0.25],
                        }}
                        transition={{
                          duration: 1.45,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        style={{ filter: 'drop-shadow(0 0 6px var(--color-spider-sense-glow))' }}
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          )}

          {/* Upper Web Orbit Nodes (static layout ref outside motion transform) */}
          <div className="relative z-10 flex flex-wrap justify-center gap-x-3 gap-y-2.5">
            {topGroup.map((skill, nIdx) => (
              <div
                key={skill.keyBase}
                ref={(el) => setNodeRef(skill.keyBase, el)}
              >
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: viewportOnce, amount: 0.2 }}
                  transition={{
                    duration: reduceMotion ? 0.15 : 0.36,
                    delay: reduceMotion ? 0 : 0.1 + nIdx * 0.045,
                    ease: EDITORIAL_EASE,
                  }}
                >
                  <SkillBadge
                    skill={skill}
                    type={skill.tier}
                    isSelected={selectedSkillKey === skill.keyBase}
                    isActive={inspectedSkill?.keyBase === skill.keyBase}
                    onHoverStart={setHoveredSkill}
                    onHoverEnd={() => setHoveredSkill(null)}
                    onSelect={onSelectSkill}
                  />
                </motion.div>
              </div>
            ))}
          </div>

          {/* Central Category Hub Node (Always displays Category Title, never redundant skill) */}
          <div className="relative z-10 flex justify-center my-0.5">
            <div className="relative inline-flex items-center justify-center">
              {!reduceMotion && (
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute -inset-1.5 rounded-full border spider-sense-pulse-ring transition-opacity duration-300 ${
                    inspectedSkill ? 'opacity-65' : 'opacity-30'
                  }`}
                />
              )}
              <div
                ref={hubRef}
                className="relative min-w-40 inline-flex items-center justify-center gap-2 rounded-full border border-primary/45 bg-canvas/95 backdrop-blur-sm px-4 py-1.5 text-[11px] font-heading font-semibold uppercase tracking-[0.18em] text-ink transition-all duration-300"
                style={{
                  boxShadow: inspectedSkill
                    ? '0 0 22px var(--color-spider-sense-glow)'
                    : '0 0 12px var(--color-web-glow)',
                }}
              >
                {isSpiderMan ? (
                  <SpiderIcon className="w-3 h-3 text-primary shrink-0" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                )}
                <span>{category.category}</span>
              </div>
            </div>
          </div>

          {/* Lower Web Orbit Nodes (static layout ref outside motion transform) */}
          {bottomGroup.length > 0 && (
            <div className="relative z-10 flex flex-wrap justify-center gap-x-3 gap-y-2.5">
              {bottomGroup.map((skill, nIdx) => (
                <div
                  key={skill.keyBase}
                  ref={(el) => setNodeRef(skill.keyBase, el)}
                >
                  <motion.div
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: viewportOnce, amount: 0.2 }}
                    transition={{
                      duration: reduceMotion ? 0.15 : 0.36,
                      delay: reduceMotion ? 0 : 0.1 + (splitAt + nIdx) * 0.045,
                      ease: EDITORIAL_EASE,
                    }}
                  >
                    <SkillBadge
                      skill={skill}
                      type={skill.tier}
                      isSelected={selectedSkillKey === skill.keyBase}
                      isActive={inspectedSkill?.keyBase === skill.keyBase}
                      onHoverStart={setHoveredSkill}
                      onHoverEnd={() => setHoveredSkill(null)}
                      onSelect={onSelectSkill}
                    />
                  </motion.div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Applied-In Detail Bar with smooth AnimatePresence transition */}
        <div className="relative z-10 pt-3 border-t border-border-subtle min-h-7 flex items-center justify-between gap-3 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {inspectedSkill ? (
              <motion.p
                key={inspectedSkill.keyBase}
                initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: EDITORIAL_EASE }}
                className="font-body text-xs text-muted truncate w-full"
              >
                <span className="font-semibold text-ink">{inspectedSkill.name}</span>
                {Array.isArray(inspectedSkill.projects) &&
                inspectedSkill.projects.length > 0 ? (
                  <span>
                    {' '}
                    · {t('expertise.appliedIn', 'Applied in')}{' '}
                    <span className="text-ink/85">
                      {inspectedSkill.projects.join(', ')}
                    </span>
                  </span>
                ) : (
                  <span>
                    {' '}
                    · {t('expertise.coreNodeNote', 'Core node & active stack')}
                  </span>
                )}
              </motion.p>
            ) : (
              <motion.p
                key="idle-hint"
                initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: EDITORIAL_EASE }}
                className="font-body text-[11px] uppercase tracking-[0.16em] text-muted/80 truncate w-full"
              >
                {t('expertise.hoverHint', 'Hover or select a node to trace connections')}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
};

export const SkillsSection = ({ sectionConfig }) => {
  const { data } = usePortfolioData();
  const { resolvedTheme } = useTheme();
  const { t } = useLanguage();
  const { expertise } = data;
  const [selectedSkillKey, setSelectedSkillKey] = useState(null);
  const [viewMode, setViewMode] = useState('network');
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return true;
    return window.matchMedia('(min-width: 1024px)').matches;
  });
  const reduceMotion = useReducedMotion();
  const skillNetworkEnabled = resolvedTheme?.config?.effects?.skillNetwork !== false;
  const viewportOnce = resolvedTheme?.config?.animation?.replayOnScroll === false;
  const canUseSkillNetwork = skillNetworkEnabled && isDesktop;
  const effectiveView = canUseSkillNetwork ? viewMode : 'marquee';

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(min-width: 1024px)');
    const syncViewport = () => setIsDesktop(mq.matches);
    syncViewport();
    mq.addEventListener?.('change', syncViewport);
    return () => mq.removeEventListener?.('change', syncViewport);
  }, []);

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
      eyebrow={t('expertise.eyebrow', '02 / Expertise')}
      title={sectionConfig?.title || 'Core Expertise'}
      subtitle={
        sectionConfig?.subtitle ||
        'The tools and technologies I use to build digital experiences.'
      }
      alignment={sectionConfig?.contentAlignment || 'left'}
    >
      {canUseSkillNetwork && (
        <div className="hidden lg:flex justify-end -mt-6">
          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-surface border border-border-subtle">
            <button
              type="button"
              onClick={() => setViewMode('network')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                effectiveView === 'network'
                  ? 'bg-primary text-(--color-on-primary) shadow-xs'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {t('expertise.webNetworkTab', 'Web Network')}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('marquee')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                effectiveView === 'marquee'
                  ? 'bg-primary text-(--color-on-primary) shadow-xs'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {t('expertise.marqueeTab', 'Marquee')}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-7 items-stretch">
        {(expertise || []).map((category, idx) =>
          effectiveView === 'network' ? (
            <WebSkillNetworkCard
              key={category.id || category.slug || idx}
              category={category}
              idx={idx}
              reduceMotion={reduceMotion}
              viewportOnce={viewportOnce}
              selectedSkillKey={selectedSkillKey}
              onSelectSkill={handleSelectSkill}
              isSpiderMan={resolvedTheme?.isSpiderMan}
            />
          ) : (
            <CategoryMarqueeCard
              key={category.id || category.slug || idx}
              category={category}
              idx={idx}
              reduceMotion={reduceMotion}
              viewportOnce={viewportOnce}
              selectedSkillKey={selectedSkillKey}
              onSelectSkill={handleSelectSkill}
            />
          )
        )}
      </div>
    </Section>
  );
};
