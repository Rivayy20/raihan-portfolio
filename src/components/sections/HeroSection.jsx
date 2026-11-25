import { Fragment, useState } from 'react';
import { motion } from 'framer-motion';
import { FaArrowDown } from 'react-icons/fa';
import { Button } from '../ui/Button';
import { DocumentViewerModal } from '../ui/DocumentViewerModal';
import { InteractiveLanyard } from '../ui/InteractiveLanyard';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { smoothScrollTo } from '../../utils/scrollTo';

const FLOATING_SLOT_POSITIONS = {
  'top-left': '-top-3 -left-6 sm:-left-10 -rotate-3',
  'top-right': 'top-4 -right-6 sm:-right-12 rotate-3',
  'bottom-left': 'bottom-10 -left-6 sm:-left-12 rotate-2',
  'bottom-right': '-bottom-2 -right-6 sm:-right-10 -rotate-2',
};

const FLOATING_COLOR_CLASSES = {
  accent: 'bg-accent text-black',
  primary: 'bg-primary text-black',
  white: 'bg-white text-black',
};

function renderHeadlineSegment(segment, idx) {
  if (segment.highlight === 'secondary_wave') {
    return (
      <span key={idx} className="text-secondary relative whitespace-nowrap">
        {segment.text}
        <svg
          className="absolute w-full h-3 bottom-1 left-0 -z-10"
          viewBox="0 0 100 10"
          preserveAspectRatio="none"
        >
          <path d="M0 5 Q 50 10 100 5" stroke="#FFD60A" strokeWidth="8" fill="transparent" />
        </svg>
      </span>
    );
  }

  if (segment.highlight === 'primary_wave') {
    return (
      <span key={idx} className="text-primary relative whitespace-nowrap">
        {segment.text}
        <svg
          className="absolute w-full h-3 bottom-1 left-0 -z-10"
          viewBox="0 0 100 10"
          preserveAspectRatio="none"
        >
          <path d="M0 5 Q 50 0 100 5" stroke="#00B4D8" strokeWidth="8" fill="transparent" />
        </svg>
      </span>
    );
  }

  if (segment.highlight === 'accent_bg') {
    return (
      <span
        key={idx}
        className="bg-accent text-black px-2 py-0.5 inline-block border-2 border-black"
      >
        {segment.text}
      </span>
    );
  }

  return <Fragment key={idx}>{segment.text}</Fragment>;
}

export const HeroSection = () => {
  const { data } = usePortfolioData();
  const { hero } = data;
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const handlePrimaryCta = (e) => {
    const target = hero?.primaryCtaHref || '#projects';
    if (/^https?:\/\//i.test(target.trim())) {
      window.open(target, '_blank', 'noopener,noreferrer');
      return;
    }
    smoothScrollTo(e, target);
  };

  const visibleFloatingLabels =
    hero?.showFloatingLabels !== false ? (hero?.floatingLabels || []).slice(0, 4) : [];

  return (
    <section
      id="home"
      className="min-h-[85vh] flex flex-col justify-center relative pt-24 pb-20 md:pt-32 md:pb-20"
    >
      <motion.div
        className={`flex flex-col ${
          hero?.showLanyard !== false ? 'lg:grid lg:grid-cols-2' : 'max-w-4xl'
        } gap-8 md:gap-12 items-center`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Content (Mobile Order 2, Desktop Order 1) */}
        <div className="flex flex-col gap-4 md:gap-6 z-10 order-2 lg:order-1 w-full mt-4 lg:mt-0">
          {hero?.showBadge !== false && hero?.badgeText && (
            <motion.div variants={itemVariants} className="inline-block">
              <span className="brutal-badge bg-primary px-4 py-2 text-sm font-bold border-2 border-black">
                {hero.badgeText}
              </span>
            </motion.div>
          )}

          <motion.h1
            variants={itemVariants}
            className="text-4xl leading-tight md:text-5xl md:leading-[1.05] lg:text-7xl font-black lg:leading-[1.1]"
          >
            {(hero?.headlineSegments || []).map((seg, idx) => renderHeadlineSegment(seg, idx))}
          </motion.h1>

          {hero?.subheadline && (
            <motion.p
              variants={itemVariants}
              className="text-base md:text-lg lg:text-xl font-medium max-w-xl text-gray-800 dark:text-gray-300 leading-relaxed transition-colors duration-300"
            >
              {hero.subheadline}
            </motion.p>
          )}

          {(hero?.showPrimaryCta !== false ||
            (hero?.showSecondaryCta !== false && Boolean(hero?.cvUrl))) && (
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4 w-full">
              {hero?.showPrimaryCta !== false && hero?.primaryCtaText && (
                <Button
                  variant="accent"
                  className="text-lg w-full h-14 sm:w-auto px-8 group"
                  onClick={handlePrimaryCta}
                >
                  <span className="block transition-transform group-hover:-translate-y-1 group-hover:-translate-x-1 group-active:translate-y-1 group-active:translate-x-1">
                    {hero.primaryCtaText}
                  </span>
                </Button>
              )}

              {hero?.showSecondaryCta !== false && hero?.cvUrl && hero?.secondaryCtaText && (
                <Button
                  variant="white"
                  className="text-lg w-full h-14 sm:w-auto px-8 border-2 border-black group"
                  onClick={() => setIsCVModalOpen(true)}
                >
                  <span className="block transition-transform group-hover:-translate-y-1 group-hover:-translate-x-1 group-active:translate-y-1 group-active:translate-x-1">
                    {hero.secondaryCtaText}
                  </span>
                </Button>
              )}
            </motion.div>
          )}
        </div>

        {/* Right Visuals (Mobile Order 1, Desktop Order 2) */}
        {hero?.showLanyard !== false && (
          <motion.div
            variants={itemVariants}
            className="relative w-full flex items-center justify-center order-1 lg:order-2 mt-12 lg:mt-0"
          >
            <InteractiveLanyard
              profileImage={hero?.profileImageUrl}
              headerText={hero?.lanyardHeader}
              statusText={hero?.lanyardStatus}
              nameText={hero?.lanyardName}
              roleText={hero?.lanyardRole}
            >
              {visibleFloatingLabels.map((item) => {
                const slotClass =
                  FLOATING_SLOT_POSITIONS[item.slot] || FLOATING_SLOT_POSITIONS['top-left'];
                const colorClass =
                  FLOATING_COLOR_CLASSES[item.colorPreset] || FLOATING_COLOR_CLASSES.accent;
                return (
                  <span
                    key={item.id}
                    className={`absolute ${slotClass} ${colorClass} brutal-border px-3 py-1 text-xs font-black uppercase tracking-wide shadow-[3px_3px_0px_0px_var(--color-black)] whitespace-nowrap`}
                  >
                    {item.text}
                  </span>
                );
              })}
            </InteractiveLanyard>
          </motion.div>
        )}
      </motion.div>

      {/* Scroll Indicator */}
      {hero?.showScrollIndicator !== false && (
        <motion.a
          href="#about"
          onClick={(e) => smoothScrollTo(e, '#about')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="relative lg:absolute mt-12 lg:mt-0 bottom-auto lg:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 group cursor-pointer z-20"
        >
          <span className="text-xs font-bold uppercase tracking-widest group-hover:text-primary transition-colors">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-10 h-10 bg-white group-hover:bg-primary brutal-border rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_var(--color-black)] group-hover:shadow-[4px_4px_0px_0px_var(--color-black)] group-hover:-translate-y-1 transition-all"
          >
            <FaArrowDown className="text-black" />
          </motion.div>
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
