import { motion, useReducedMotion } from 'framer-motion';
import { FaCertificate } from 'react-icons/fa';
import { CertificationCard } from './CertificationCard';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { EDITORIAL_EASE } from '../../utils/motionVariants';

export const CertificationsSection = ({ expandedId, onToggle }) => {
  const { data } = usePortfolioData();
  const { resolvedTheme } = useTheme();
  const { t } = useLanguage();
  const { about, certifications } = data;
  const reduceMotion = useReducedMotion();
  const viewportOnce = resolvedTheme?.config?.animation?.replayOnScroll === false;

  const headerVariants = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0.2 : 0.75, ease: EDITORIAL_EASE },
    },
  };

  const gridContainerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.14,
        delayChildren: reduceMotion ? 0 : 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0.2 : 0.78, ease: EDITORIAL_EASE },
    },
  };

  return (
    <div>
      <motion.div
        variants={headerVariants}
        initial={reduceMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: viewportOnce, amount: 0.15 }}
        className="flex items-center gap-3.5 mb-8"
      >
        <span className="w-10 h-10 rounded-xl bg-secondary/15 border border-secondary/35 flex items-center justify-center text-base text-ink shrink-0">
          <FaCertificate aria-hidden="true" />
        </span>
        <div>
          <p className="font-body text-xs font-medium uppercase tracking-[0.18em] text-muted">
            {t('about.verifiedCredentials', 'Verified Credentials')}
          </p>
          <h3 className="font-heading text-2xl sm:text-3xl font-medium text-ink">
            {about?.certificationsHeading || 'Certifications'}
          </h3>
        </div>
      </motion.div>

      <motion.div
        variants={gridContainerVariants}
        initial={reduceMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: viewportOnce, amount: 0.12 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start"
      >
        {certifications.map((cert, idx) => {
          const certId = cert.rowId || cert.id || `cert-${idx}`;
          return (
            <motion.div key={certId} variants={cardVariants}>
              <CertificationCard
                {...cert}
                id={cert.credentialCode || cert.id}
                isExpanded={expandedId === certId}
                onToggle={() => onToggle(certId)}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
