import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaDownload, FaFilePdf, FaExternalLinkAlt } from 'react-icons/fa';
import { createPortal } from 'react-dom';
import { buildStorageDownloadUrl } from '../../constants/storageConfig';
import { sanitizeMediaUrl } from '../../utils/safeUrl';

export const DocumentViewerModal = ({ isOpen, onClose, pdfUrl, title }) => {
  const safePdfUrl = sanitizeMediaUrl(pdfUrl);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen && safePdfUrl) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, safePdfUrl, onClose]);

  if (!isOpen || !safePdfUrl) return null;

  const safeFilename = title
    ? `${String(title).trim().replace(/[^a-zA-Z0-9._-]+/g, '_')}.pdf`
    : '';
  const downloadUrl = buildStorageDownloadUrl(safePdfUrl, safeFilename);
  const iframeSrc = safePdfUrl.includes('#') ? safePdfUrl : `${safePdfUrl}#toolbar=0`;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#101012]/80 backdrop-blur-md cursor-pointer"
        />

        <motion.div
          initial={{ y: 24, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 16, opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          className="relative bg-surface border border-border-subtle rounded-2xl w-full h-full max-w-5xl flex flex-col shadow-2xl overflow-hidden z-10"
        >
          {/* Minimalist Header */}
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border-subtle bg-surface">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-primary/15 text-ink flex items-center justify-center shrink-0 text-sm">
                <FaFilePdf />
              </span>
              <h2 className="font-heading text-base sm:text-lg font-medium truncate text-ink">
                {title}
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={safePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-2 rounded-full border border-border-subtle px-3.5 py-2 text-xs font-medium text-ink hover:bg-surface-subtle transition-colors"
                aria-label="Open PDF in New Tab"
              >
                <FaExternalLinkAlt className="text-[11px]" /> Open
              </a>
              <a
                href={downloadUrl}
                download={safeFilename || true}
                className="inline-flex items-center gap-2 rounded-full bg-ink text-canvas hover:bg-primary hover:text-[#171719] px-4 py-2 text-xs font-medium transition-colors"
              >
                <FaDownload className="text-[11px]" />
                <span className="hidden sm:inline">Download</span>
              </a>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full border border-border-subtle flex items-center justify-center text-muted hover:text-ink hover:bg-surface-subtle transition-colors cursor-pointer"
                aria-label="Close Modal"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>
          </div>

          {/* Desktop PDF Viewer */}
          <div className="hidden md:block flex-1 overflow-hidden bg-surface-subtle">
            <iframe
              src={iframeSrc}
              className="w-full h-full border-none"
              title={`${title} Viewer`}
            />
          </div>

          {/* Mobile Fallback UI */}
          <div className="flex md:hidden flex-1 flex-col items-center justify-center p-8 bg-canvas text-center overflow-y-auto">
            <div className="w-16 h-16 rounded-2xl bg-primary/12 border border-primary/25 flex items-center justify-center mb-5 text-2xl text-ink">
              <FaFilePdf />
            </div>
            <h3 className="font-heading text-xl font-medium mb-2 text-ink">
              Document Preview
            </h3>
            <p className="text-muted text-sm mb-7 max-w-xs leading-relaxed">
              Your mobile browser does not display inline PDF frames. Tap below to open or download the document cleanly.
            </p>
            <a
              href={safePdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full bg-ink text-canvas hover:bg-primary hover:text-[#171719] font-medium px-7 py-3.5 text-sm transition-colors"
            >
              <FaExternalLinkAlt className="text-xs" /> Open PDF Document
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
