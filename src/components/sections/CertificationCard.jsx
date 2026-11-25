import { useState } from 'react';
import { Card } from '../ui/Card';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  FaArrowRight,
  FaAward,
  FaCheckCircle,
  FaChevronDown,
  FaExternalLinkAlt,
  FaFilePdf,
} from 'react-icons/fa';
import { DocumentViewerModal } from '../ui/DocumentViewerModal';
import { getCertificationCardColor } from '../../constants/colorPresets';
import { EDITORIAL_EASE } from '../../utils/motionVariants';

const VERIFICATION_STATUS_META = {
  verified: {
    dotClass: 'text-emerald-600 dark:text-emerald-400',
    label: 'Verified Credential',
  },
  in_progress: {
    dotClass: 'text-amber-600 dark:text-amber-400',
    label: 'In Progress',
  },
  expired: {
    dotClass: 'text-red-600 dark:text-red-400',
    label: 'Expired',
  },
  unverified: {
    dotClass: 'text-muted',
    label: 'Unverified',
  },
};

export const CertificationCard = ({
  title,
  credentialName,
  issuer,
  date,
  pdf,
  id,
  verificationStatus = 'verified',
  verificationUrl = '',
  colorPreset = 'white',
  color,
  isExpanded,
  onToggle,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const cardColorClass = color || getCertificationCardColor(colorPreset);
  const statusMeta =
    VERIFICATION_STATUS_META[verificationStatus] || VERIFICATION_STATUS_META.verified;

  const handleCardKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <>
      <Card
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={onToggle}
        onKeyDown={handleCardKeyDown}
        className={`group min-h-46 flex flex-col justify-between p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${cardColorClass} ${
          isExpanded ? 'border-primary/50' : ''
        }`}
      >
        <div className="flex flex-col gap-4">
          {/* Top Bar: Credential Icon, Issuer Badge & Issue Date */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                aria-hidden="true"
                className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-xs shrink-0 transition-colors duration-300 group-hover:bg-primary/18"
              >
                <FaAward />
              </span>
              <span className="rounded-full bg-surface-subtle border border-border-subtle px-2.5 py-0.5 font-body text-[11px] font-medium uppercase tracking-wider text-ink/80 truncate">
                {issuer}
              </span>
            </div>

            {date && (
              <span className="font-body text-xs text-muted shrink-0">{date}</span>
            )}
          </div>

          {/* Certification Title & Scannable Status */}
          <div className="space-y-2">
            <h4 className="font-heading text-lg sm:text-xl font-medium text-ink leading-snug group-hover:text-ink transition-colors">
              {title}
            </h4>
            <p className="font-body text-xs text-muted inline-flex items-center gap-1.5">
              <FaCheckCircle aria-hidden="true" className={statusMeta.dotClass} />
              <span>{statusMeta.label}</span>
            </p>
          </div>
        </div>

        <div className="mt-5">
          {/* Footer Action Row */}
          <div className="pt-3.5 border-t border-border-subtle flex items-center justify-between text-xs font-medium text-muted group-hover:text-primary transition-colors duration-300">
            <span>{isExpanded ? 'Hide Details' : 'View Credential'}</span>
            {isExpanded ? (
              <FaChevronDown
                aria-hidden="true"
                className="text-[11px] rotate-180 transition-transform duration-300"
              />
            ) : (
              <FaArrowRight
                aria-hidden="true"
                className="text-[11px] transition-transform duration-300 group-hover:translate-x-1"
              />
            )}
          </div>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.25,
                  ease: EDITORIAL_EASE,
                }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-3.5 border-t border-border-subtle space-y-3 text-sm">
                  <div>
                    <p className="font-body text-[11px] font-medium uppercase tracking-wider text-muted">
                      Credential Name
                    </p>
                    <p className="font-body font-medium text-ink mt-0.5">
                      {credentialName || title}
                    </p>
                  </div>

                  {id && (
                    <div>
                      <p className="font-body text-[11px] font-medium uppercase tracking-wider text-muted">
                        Credential ID
                      </p>
                      <p className="font-mono text-xs text-ink/90 mt-0.5 break-all">
                        {id}
                      </p>
                    </div>
                  )}

                  {(pdf || verificationUrl) && (
                    <div className="pt-2 flex flex-wrap gap-2.5">
                      {pdf && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsModalOpen(true);
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink text-canvas hover:bg-primary hover:text-[#171719] px-4 py-2 text-xs font-medium transition-colors cursor-pointer"
                        >
                          <FaFilePdf aria-hidden="true" /> View Certificate
                        </button>
                      )}
                      {verificationUrl && (
                        <a
                          href={verificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="group/link inline-flex items-center justify-center gap-1.5 rounded-full border border-border-strong px-4 py-2 text-xs font-medium text-ink hover:bg-surface-subtle transition-colors"
                        >
                          <FaExternalLinkAlt
                            aria-hidden="true"
                            className="text-[10px] transition-transform duration-200 group-hover/link:translate-x-0.5"
                          />{' '}
                          Verify
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {pdf && (
        <DocumentViewerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          pdfUrl={pdf}
          title={title}
        />
      )}
    </>
  );
};
