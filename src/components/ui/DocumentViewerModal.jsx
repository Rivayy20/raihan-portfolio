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

  const safeFilename = title ? `${String(title).trim().replace(/[^a-zA-Z0-9._-]+/g, '_')}.pdf` : '';
  const downloadUrl = buildStorageDownloadUrl(safePdfUrl, safeFilename);
  const iframeSrc = safePdfUrl.includes('#') ? safePdfUrl : `${safePdfUrl}#toolbar=0`;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
        />

        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          className="relative bg-white brutal-border w-full h-full max-w-5xl flex flex-col shadow-[8px_8px_0px_0px_var(--color-black)] z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b-4 border-black bg-[#FFD60A]">
            <h2 className="font-black text-xl truncate pr-4 text-black">{title}</h2>
            <div className="flex gap-2 shrink-0">
              <a
                href={safePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex brutal-btn bg-white border-2 border-black px-3.5 py-2 items-center gap-2 text-sm font-bold shadow-[2px_2px_0px_0px_var(--color-black)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all text-black"
                aria-label="Open PDF in New Tab"
              >
                <FaExternalLinkAlt /> <span>Open</span>
              </a>
              <a
                href={downloadUrl}
                download={safeFilename || true}
                className="brutal-btn bg-white border-2 border-black px-4 py-2 flex items-center gap-2 text-sm font-bold shadow-[2px_2px_0px_0px_var(--color-black)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all text-black"
              >
                <FaDownload /> <span className="hidden sm:inline">Download</span>
              </a>
              <button
                type="button"
                onClick={onClose}
                className="brutal-btn bg-black text-white border-2 border-black px-4 py-2 flex items-center gap-2 shadow-[2px_2px_0px_0px_var(--color-white)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
                aria-label="Close Modal"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Desktop PDF Viewer */}
          <div className="hidden md:block flex-1 overflow-hidden bg-gray-200 dark:bg-[#1A1A1A] transition-colors duration-300">
            <iframe
              src={iframeSrc}
              className="w-full h-full border-none"
              title={`${title} Viewer`}
            />
          </div>

          {/* Mobile Fallback UI */}
          <div className="flex md:hidden flex-1 flex-col items-center justify-center p-6 bg-gray-200 dark:bg-[#1A1A1A] transition-colors duration-300 text-center overflow-y-auto">
            <div className="w-24 h-24 mb-6 text-gray-400">
              <FaFilePdf className="w-full h-full drop-shadow-md" />
            </div>
            <h3 className="text-2xl font-black mb-3 dark:text-white">Preview Not Supported</h3>
            <p className="text-gray-600 dark:text-gray-300 font-medium mb-8 max-w-sm text-base">
              Your mobile browser doesn't support inline PDF viewing. Please tap the button below to view or download the document securely.
            </p>
            <a
              href={safePdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="brutal-btn bg-primary text-black font-black px-8 py-4 text-lg border-4 border-black shadow-[4px_4px_0px_0px_var(--color-black)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none active:translate-y-1 active:translate-x-1 active:shadow-none transition-all flex items-center gap-3"
            >
              <FaExternalLinkAlt /> Open PDF Document
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
