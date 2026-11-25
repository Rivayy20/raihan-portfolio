import { createElement, Fragment, useMemo, useState } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { FaArrowRight, FaCode } from 'react-icons/fa';
import { Button } from '../ui/Button';
import { DocumentViewerModal } from '../ui/DocumentViewerModal';
import { TypewriterText } from '../ui/TypewriterText';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { EDITORIAL_EASE } from '../../utils/motionVariants';
import { smoothScrollTo } from '../../utils/scrollTo';
import { getSocialIconComponent } from '../../utils/socialIcons';

function buildHeadlineClusters(segments = []) {
  const tokens = [];
  let currentCluster = [];

  for (const seg of segments) {
    const parts = String(seg?.text || '').split(/(\s+)/);
    for (const part of parts) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        if (currentCluster.length > 0) {
          tokens.push({ type: 'word', parts: currentCluster });
          currentCluster = [];
        }
        tokens.push({ type: 'space', text: part });
      } else {
        currentCluster.push({
          text: part,
          highlight: seg?.highlight || 'none',
        });
      }
    }
  }

  if (currentCluster.length > 0) {
    tokens.push({ type: 'word', parts: currentCluster });
  }

  return tokens;
}

function renderHeadlinePart(part, idx) {
  if (
    part.highlight === 'secondary_wave' ||
    part.highlight === 'primary_wave'
  ) {
    return (
      <span key={idx} className="hero-gradient-text-animated font-medium">
        {part.text}
      </span>
    );
  }

  if (part.highlight === 'accent_bg') {
    return (
      <span
        key={idx}
        className="inline-block rounded-lg bg-accent/25 px-2.5 py-0.5 text-ink"
      >
        {part.text}
      </span>
    );
  }

  return <Fragment key={idx}>{part.text}</Fragment>;
}

export const HeroSection = () => {
  const { data, introReady = true } = usePortfolioData();
  const { hero, settings, contact, socialLinks } = data;
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 180, damping: 22, mass: 0.6 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 180, damping: 22, mass: 0.6 });
  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-6, 6]);

  const visibleSocials = useMemo(
    () =>
      (socialLinks || [])
        .filter((item) => item.showInContact && item.isVisible !== false)
        .slice(0, 4),
    [socialLinks]
  );

  const visibleCaptionTags =
    hero?.showFloatingLabels !== false
      ? (hero?.floatingLabels || []).slice(0, 4)
      : [];

  const headlineTokens = useMemo(
    () => buildHeadlineClusters(hero?.headlineSegments || []),
    [hero?.headlineSegments]
  );

  const headlineWordCount = useMemo(
    () => headlineTokens.filter((token) => token.type === 'word').length,
    [headlineTokens]
  );

  // Start typewriter cleanly once Stage 2 heading stagger finishes
  const typewriterStartDelayMs = useMemo(() => {
    const completionSec =
      0.35 + Math.max(headlineWordCount - 1, 0) * 0.14 + 1.05;
    return Math.min(2600, Math.max(1200, Math.round(completionSec * 1000)));
  }, [headlineWordCount]);

  const animateState = introReady ? 'visible' : 'hidden';

  // Stage 1: Introduction Label (0.85s)
  const labelVariants = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0.2 : 0.85,
        delay: reduceMotion ? 0 : 0.05,
        ease: EDITORIAL_EASE,
      },
    },
  };

  // Stage 2: Staggered Main Heading Reveal (1.1s per cluster, 0.14s stagger)
  const headingContainerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.14,
        delayChildren: reduceMotion ? 0 : 0.35,
      },
    },
  };

  const headingWordVariants = {
    hidden: reduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 18, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: reduceMotion ? 0.2 : 1.1,
        ease: EDITORIAL_EASE,
      },
    },
  };

  // Stage 3: Circular Portrait Subtle Spring Entrance (~1.3s)
  const portraitVariants = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: reduceMotion
        ? { duration: 0.2 }
        : {
            type: 'spring',
            stiffness: 55,
            damping: 20,
            mass: 1.1,
            delay: 0.85,
          },
    },
  };

  const captionVariants = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0.2 : 0.85,
        delay: reduceMotion ? 0 : 1.45,
        ease: EDITORIAL_EASE,
      },
    },
  };

  // Stage 4: Floating Information Cards & Decorative Particles
  const floatingCardAVariants = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0.2 : 1.1,
        delay: reduceMotion ? 0 : 1.55,
        ease: EDITORIAL_EASE,
      },
    },
  };

  const floatingCardBVariants = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0.2 : 1.1,
        delay: reduceMotion ? 0 : 1.85,
        ease: EDITORIAL_EASE,
      },
    },
  };

  const particleRevealVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: reduceMotion ? 0.2 : 1.0,
        delay: reduceMotion ? 0 : 1.65,
        ease: EDITORIAL_EASE,
      },
    },
  };

  // Stage 5: CTA Buttons (after heading completes)
  const ctaVariants = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0.2 : 0.9,
        delay: reduceMotion ? 0 : 2.35,
        ease: EDITORIAL_EASE,
      },
    },
  };

  // Stage 6: Social Media Icons, Availability & Scroll Cue
  const socialBarVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: reduceMotion ? 0.2 : 0.85,
        delay: reduceMotion ? 0 : 2.85,
        ease: EDITORIAL_EASE,
      },
    },
  };

  const scrollCueVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: reduceMotion ? 0.2 : 0.85,
        delay: reduceMotion ? 0 : 3.15,
        ease: EDITORIAL_EASE,
      },
    },
  };

  const handlePrimaryCta = (e) => {
    const target = hero?.primaryCtaHref || '#projects';
    if (/^https?:\/\//i.test(target.trim())) {
      window.open(target, '_blank', 'noopener,noreferrer');
      return;
    }
    smoothScrollTo(e, target);
  };

  const handlePortraitMouseMove = (e) => {
    if (reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handlePortraitMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      id="home"
      className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center pt-28 pb-16 md:pt-32 md:pb-24"
    >
      {/* Subtle Background Texture Layers */}
      <div
        aria-hidden="true"
        className="hero-grain-overlay pointer-events-none absolute inset-0 -z-20"
      />
      <div
        aria-hidden="true"
        className="hero-dot-pattern pointer-events-none absolute inset-0 -z-20"
      />

      {/* Restrained Coral-Pink Sunset Ambient Glow Behind Portrait */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 right-0 w-85 sm:w-120 lg:w-155 h-85 sm:h-120 lg:h-155 rounded-full opacity-30 dark:opacity-22 blur-3xl -z-10"
        style={{
          background:
            'radial-gradient(circle at 60% 35%, rgba(255,107,107,0.42), rgba(244,143,177,0.28) 44%, rgba(73,52,95,0.18) 74%, transparent 100%)',
        }}
      />

      <div
        className={`flex flex-col ${
          hero?.showLanyard !== false
            ? 'lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-16'
            : 'max-w-4xl'
        } gap-10 md:gap-12 items-center`}
      >
        {/* Left Content: Coordinated Staggered Typography, Typewriter & CTAs */}
        <div
          className={`${
            hero?.showLanyard !== false ? 'lg:col-span-7' : ''
          } flex flex-col gap-5 sm:gap-6 w-full z-10`}
        >
          {/* Stage 1: Introduction Label */}
          {hero?.showBadge !== false && hero?.badgeText && (
            <motion.div
              variants={labelVariants}
              initial={reduceMotion ? false : 'hidden'}
              animate={animateState}
            >
              <span className="inline-flex items-center gap-2.5 font-body text-[11px] sm:text-xs font-medium uppercase tracking-[0.2em] text-muted">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-primary shrink-0"
                  aria-hidden="true"
                />
                {hero.badgeText}
              </span>
            </motion.div>
          )}

          {/* Stage 2: Main Heading */}
          <motion.h1
            variants={headingContainerVariants}
            initial={reduceMotion ? false : 'hidden'}
            animate={animateState}
            className="font-heading text-[clamp(2.25rem,5vw,4.5rem)] font-medium tracking-[-0.035em] leading-[1.04] text-ink"
          >
            {headlineTokens.map((token, tokenIdx) =>
              token.type === 'space' ? (
                <Fragment key={`space-${tokenIdx}`}>{token.text}</Fragment>
              ) : (
                <motion.span
                  key={`word-${tokenIdx}`}
                  variants={headingWordVariants}
                  className="inline-block whitespace-nowrap"
                >
                  {token.parts.map((part, partIdx) =>
                    renderHeadlinePart(part, partIdx)
                  )}
                </motion.span>
              )
            )}
          </motion.h1>

          {/* Description Typewriter Animation (starts after heading completes) */}
          {hero?.subheadline && (
            <TypewriterText
              key={hero.subheadline}
              text={hero.subheadline}
              start={introReady}
              startDelayMs={typewriterStartDelayMs}
              speedMs={30}
              className="font-body text-base sm:text-lg text-muted max-w-xl leading-[1.75]"
            />
          )}

          {/* Stage 5: CTA Buttons */}
          {(hero?.showPrimaryCta !== false ||
            (hero?.showSecondaryCta !== false && Boolean(hero?.cvUrl))) && (
            <motion.div
              variants={ctaVariants}
              initial={reduceMotion ? false : 'hidden'}
              animate={animateState}
              className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2"
            >
              {hero?.showPrimaryCta !== false && hero?.primaryCtaText && (
                <Button
                  variant="primary"
                  className="group px-7 py-3.5 text-sm shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-98"
                  onClick={handlePrimaryCta}
                >
                  <span>{hero.primaryCtaText}</span>
                  <FaArrowRight
                    className="text-xs opacity-85 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Button>
              )}

              {hero?.showSecondaryCta !== false &&
                hero?.cvUrl &&
                hero?.secondaryCtaText && (
                  <Button
                    variant="white"
                    className="px-7 py-3.5 text-sm hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 active:scale-98"
                    onClick={() => setIsCVModalOpen(true)}
                  >
                    {hero.secondaryCtaText}
                  </Button>
                )}
            </motion.div>
          )}

          {/* Stage 6: Social Icons & Availability */}
          {(visibleSocials.length > 0 || contact?.locationText) && (
            <motion.div
              variants={socialBarVariants}
              initial={reduceMotion ? false : 'hidden'}
              animate={animateState}
              className="flex flex-wrap items-center justify-between gap-4 border-t border-border-subtle pt-6 mt-3 max-w-xl"
            >
              {visibleSocials.length > 0 && (
                <div className="flex items-center gap-2.5">
                  {visibleSocials.map((social) => {
                    const IconComp = getSocialIconComponent(social.platform);
                    return (
                      <a
                        key={social.id || social.platform}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.tooltipText || social.label}
                        className="w-10 h-10 rounded-full border border-border-subtle bg-surface/85 flex items-center justify-center text-sm text-muted transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-primary/12 hover:text-primary hover:border-primary/45 hover:shadow-sm active:scale-95"
                      >
                        {createElement(IconComp, { 'aria-hidden': true })}
                      </a>
                    );
                  })}
                </div>
              )}

              {(contact?.locationText || contact?.availabilityStatus) && (
                <p className="font-body text-xs text-muted flex items-center gap-2">
                  {contact?.isAvailable !== false && (
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <span>
                    {[contact?.availabilityStatus, contact?.locationText]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </p>
              )}
            </motion.div>
          )}
        </div>

        {/* Right Visual: Interactive Circular Portrait, Conic Ring & Floating Cards */}
        {hero?.showLanyard !== false && hero?.profileImageUrl && (
          <div className="lg:col-span-5 w-full flex flex-col items-center lg:items-end">
            <div className="relative w-full max-w-70 sm:max-w-85 lg:max-w-100">
              {/* Stage 4: Subtle Floating Decorative Particles */}
              <motion.span
                aria-hidden="true"
                variants={particleRevealVariants}
                initial={reduceMotion ? false : 'hidden'}
                animate={animateState}
                className="hero-float-particle-1 pointer-events-none absolute top-4 left-3 w-2.5 h-2.5 rounded-full bg-primary/55 z-0"
              />
              <motion.span
                aria-hidden="true"
                variants={particleRevealVariants}
                initial={reduceMotion ? false : 'hidden'}
                animate={animateState}
                className="hero-float-particle-2 pointer-events-none absolute top-12 -right-2 w-3 h-3 rounded-full border border-secondary/65 z-0"
              />
              <motion.span
                aria-hidden="true"
                variants={particleRevealVariants}
                initial={reduceMotion ? false : 'hidden'}
                animate={animateState}
                className="hero-float-particle-3 pointer-events-none absolute bottom-14 left-1 w-2 h-2 rounded-full bg-lavender/65 z-0"
              />

              {/* Stage 4: Floating Info Card 1 (Availability) */}
              {contact?.showAvailability !== false && (
                <motion.div
                  variants={floatingCardAVariants}
                  initial={reduceMotion ? false : 'hidden'}
                  animate={animateState}
                  className="hidden sm:block absolute -top-1 -left-4 lg:-left-7 z-20 pointer-events-none select-none"
                >
                  <div className="flex items-center gap-2.5 editorial-glass border border-border-subtle rounded-2xl px-3.5 py-2 shadow-sm hero-float-card-a">
                    <span
                      className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="font-body text-xs font-medium text-ink whitespace-nowrap">
                      {contact?.availabilityStatus || 'Available for Freelance'}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Stage 4: Floating Info Card 2 (Role Badge) */}
              <motion.div
                variants={floatingCardBVariants}
                initial={reduceMotion ? false : 'hidden'}
                animate={animateState}
                className="hidden sm:block absolute bottom-16 -right-3 lg:-right-6 z-20 pointer-events-none select-none"
              >
                <div className="flex items-center gap-2.5 editorial-glass border border-border-subtle rounded-2xl px-3.5 py-2 shadow-sm hero-float-card-b">
                  <span
                    className="w-6 h-6 rounded-lg bg-primary/14 text-primary flex items-center justify-center text-[11px] shrink-0"
                    aria-hidden="true"
                  >
                    <FaCode />
                  </span>
                  <span className="font-body text-xs font-medium text-ink whitespace-nowrap">
                    {hero?.floatingLabels?.[0]?.text || 'Web Developer'}
                  </span>
                </div>
              </motion.div>

              {/* Stage 3: Portrait Spring Reveal + 3D Tilt Stage */}
              <motion.div
                variants={portraitVariants}
                initial={reduceMotion ? false : 'hidden'}
                animate={animateState}
              >
                <motion.div
                  onMouseMove={handlePortraitMouseMove}
                  onMouseLeave={handlePortraitMouseLeave}
                  style={
                    reduceMotion
                      ? undefined
                      : { rotateX, rotateY, transformPerspective: 1000 }
                  }
                  className="group relative"
                >
                  {/* Soft Coral-Pink-Purple Outer Glow */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-3 rounded-full blur-2xl opacity-30 group-hover:opacity-55 transition-opacity duration-500"
                    style={{
                      background:
                        'radial-gradient(circle, rgba(255,107,107,0.45), rgba(244,143,177,0.28) 55%, rgba(167,139,250,0.18) 80%, transparent 100%)',
                    }}
                  />

                  {/* Secondary Thin Double-Ring Outline */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-2.5 rounded-full border border-ink/10 dark:border-white/12 transition-transform duration-500 group-hover:scale-102"
                  />

                  {/* Animated Conic-Gradient Rotating Border */}
                  <div className="relative aspect-square w-full rounded-full p-0.75 overflow-hidden shadow-[0_24px_64px_-22px_rgba(73,52,95,0.28)] dark:shadow-[0_24px_64px_-18px_rgba(0,0,0,0.65)]">
                    <div
                      aria-hidden="true"
                      className="hero-conic-border pointer-events-none absolute -inset-1/2"
                    />

                    {/* Inner Circular Portrait Canvas */}
                    <div
                      className="relative z-10 w-full h-full rounded-full overflow-hidden ring-2 ring-canvas"
                      style={{
                        background:
                          'linear-gradient(160deg, #49345F 0%, #8E4A73 34%, #FF6B6B 72%, #FFB38A 100%)',
                      }}
                    >
                      {/* Soft inner ambient glow */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background:
                            'radial-gradient(circle at 75% 18%, rgba(255, 179, 138, 0.35), transparent 55%)',
                        }}
                      />

                      <img
                        src={hero.profileImageUrl}
                        alt={hero.lanyardName || settings?.fullName || 'Raihan Azka Hidayat'}
                        fetchPriority="high"
                        decoding="async"
                        className="relative z-10 w-full h-full object-cover object-[50%_20%] transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Subtle editorial caption centered below circular portrait */}
              {(hero?.lanyardName || settings?.fullName || hero?.lanyardRole) && (
                <motion.div
                  variants={captionVariants}
                  initial={reduceMotion ? false : 'hidden'}
                  animate={animateState}
                  className="mt-4 text-center"
                >
                  {(hero?.lanyardName || settings?.fullName) && (
                    <p className="font-heading text-sm sm:text-base font-medium tracking-wide text-ink">
                      {hero?.lanyardName || settings?.fullName}
                    </p>
                  )}
                  {hero?.lanyardRole && (
                    <p className="font-body text-xs text-muted mt-0.5">
                      {hero.lanyardRole}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Optional CMS caption labels placed cleanly beneath portrait */}
              {visibleCaptionTags.length > 0 && (
                <motion.div
                  variants={captionVariants}
                  initial={reduceMotion ? false : 'hidden'}
                  animate={animateState}
                  className="mt-3 flex flex-wrap justify-center gap-2"
                >
                  {visibleCaptionTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full border border-border-subtle bg-surface px-3 py-1 font-body text-[11px] font-medium text-muted"
                    >
                      {tag.text}
                    </span>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stage 6: Minimalist Interactive Scroll Indicator */}
      {hero?.showScrollIndicator !== false && (
        <motion.a
          href="#about"
          onClick={(e) => smoothScrollTo(e, '#about')}
          aria-label="Scroll to explore, jump to About section"
          variants={scrollCueVariants}
          initial={reduceMotion ? false : 'hidden'}
          animate={animateState}
          className="inline-flex items-center gap-3.5 self-center lg:self-start mt-10 py-1.5 px-2 -mx-2 rounded-xl transition-colors duration-300 group focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          {/* Minimalist Mouse-Scroll Outline with Animated Dot */}
          <span
            aria-hidden="true"
            className="w-5 h-8 rounded-full border border-border-strong group-hover:border-primary/80 transition-colors duration-300 flex justify-center pt-1.5 shrink-0"
          >
            <span className="hero-mouse-dot w-1 h-1.5 rounded-full bg-ink/70 group-hover:bg-primary transition-colors duration-300" />
          </span>

          {/* Thin Vertical Coral-Accented Decorative Line */}
          <span
            aria-hidden="true"
            className="relative h-8 w-px bg-border-strong/55 overflow-hidden rounded-full shrink-0"
          >
            <span className="hero-scroll-runner block w-full h-3 bg-primary rounded-full" />
          </span>

          {/* Editorial Labels & Hover Chevron */}
          <span className="flex flex-col text-left">
            <span className="inline-flex items-center gap-2 font-body text-[11px] font-medium uppercase tracking-[0.22em] text-ink/85 group-hover:text-primary transition-colors duration-300">
              <span>Scroll to explore</span>
              <svg
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
                className="w-3 h-3 text-muted group-hover:text-primary group-hover:translate-y-0.5 transition-all duration-300"
              >
                <path
                  d="M2.5 4.5L6 8L9.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="font-body text-[11px] text-muted tracking-wide mt-0.5">
              Discover what&apos;s next
            </span>
          </span>
        </motion.a>
      )}

      {hero?.cvUrl && (
        <DocumentViewerModal
          isOpen={isCVModalOpen}
          onClose={() => setIsCVModalOpen(false)}
          pdfUrl={hero.cvUrl}
          title={hero.cvModalTitle || 'My CV'}
        />
      )}
    </section>
  );
};
