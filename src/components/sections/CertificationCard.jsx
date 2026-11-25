import { useState } from 'react';
import { Card } from '../ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronUp, FaExternalLinkAlt, FaFilePdf } from 'react-icons/fa';
import { DocumentViewerModal } from '../ui/DocumentViewerModal';
import { getCertificationCardColor } from '../../constants/colorPresets';

const VERIFICATION_STATUS_META = {
  verified: { symbol: '✔', colorClass: 'text-green-600', label: 'Verified Credential' },
  in_progress: { symbol: '◔', colorClass: 'text-amber-600', label: 'In Progress' },
  expired: { symbol: '!', colorClass: 'text-red-600', label: 'Expired' },
  unverified: { symbol: '—', colorClass: 'text-gray-500', label: 'Unverified' },
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

  const cardColorClass = color || getCertificationCardColor(colorPreset);
  const statusMeta =
    VERIFICATION_STATUS_META[verificationStatus] || VERIFICATION_STATUS_META.verified;

  return (
    <>
      <Card
        className={`relative overflow-hidden group transition-all duration-300 ${cardColorClass} flex flex-col justify-between cursor-pointer ${
          isExpanded
            ? 'shadow-[6px_6px_0px_0px_var(--color-black)] -translate-y-1'
            : 'hover:-translate-y-2'
        }`}
        onClick={onToggle}
      >
        <div className="flex flex-col gap-2 z-10 relative">
          <div className="flex justify-between items-start gap-4">
            <span className="font-heading font-bold text-sm bg-white/90 text-black brutal-border px-3 py-1 inline-block">
              {issuer}
            </span>
          </div>

          <h3 className="text-xl md:text-2xl font-black mt-2 text-black">{title}</h3>

          <div className="mt-auto pt-4 flex items-center justify-between font-bold text-sm opacity-80 group-hover:opacity-100 transition-opacity text-black">
            <span>{isExpanded ? 'Collapse' : 'Click to Expand'}</span>
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t-2 border-black/20 mt-2 text-black">
                  <div className="mb-4">
                    <p className="font-bold text-sm opacity-70">Issuer</p>
                    <p className="font-bold">{issuer}</p>
                  </div>
                  <div className="mb-4">
                    <p className="font-bold text-sm opacity-70">Credential</p>
                    <p className="font-bold">{credentialName || title}</p>
                  </div>
                  {date && (
                    <div className="mb-4">
                      <p className="font-bold text-sm opacity-70">Issue Date</p>
                      <p className="font-bold">{date}</p>
                    </div>
                  )}
                  {id && (
                    <div className="mb-4">
                      <p className="font-bold text-sm opacity-70">Credential ID</p>
                      <p className="font-bold break-all">{id}</p>
                    </div>
                  )}
                  <div className="mb-6">
                    <p className="font-bold text-sm opacity-70">Verification</p>
                    <p className="font-bold flex items-center gap-2">
                      <span className={statusMeta.colorClass}>{statusMeta.symbol}</span>{' '}
                      {statusMeta.label}
                    </p>
                  </div>

                  {(pdf || verificationUrl) && (
                    <div className="pb-2 flex flex-wrap gap-3">
                      {pdf && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsModalOpen(true);
                          }}
                          className="flex items-center gap-2 bg-black text-white font-bold py-3 px-5 brutal-border hover:bg-white hover:text-black transition-colors w-full justify-center sm:w-auto cursor-pointer"
                        >
                          <FaFilePdf /> View Certificate
                        </button>
                      )}
                      {verificationUrl && (
                        <a
                          href={verificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 bg-white text-black font-bold py-3 px-5 brutal-border hover:bg-accent transition-colors w-full justify-center sm:w-auto"
                        >
                          <FaExternalLinkAlt /> Verify
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500 z-0 pointer-events-none" />
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
