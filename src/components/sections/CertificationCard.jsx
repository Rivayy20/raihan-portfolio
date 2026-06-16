import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronUp, FaFilePdf } from 'react-icons/fa';
import { DocumentViewerModal } from '../ui/DocumentViewerModal';

export const CertificationCard = ({ title, issuer, date, pdf, id, color = 'bg-primary', isExpanded, onToggle }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card 
        className={`relative overflow-hidden group transition-all duration-300 ${color} flex flex-col justify-between cursor-pointer ${isExpanded ? 'shadow-[6px_6px_0px_0px_var(--color-black)] -translate-y-1' : 'hover:-translate-y-2'}`}
        onClick={onToggle}
      >
        <div className="flex flex-col gap-2 z-10 relative">
          <div className="flex justify-between items-start gap-4">
            <span className="font-heading font-bold text-sm bg-white/90 text-black brutal-border px-3 py-1 inline-block">
              {issuer}
            </span>
          </div>
          
          <h3 className="text-xl md:text-2xl font-black mt-2 text-black">
            {title}
          </h3>
          
          <div className="mt-auto pt-4 flex items-center justify-between font-bold text-sm opacity-80 group-hover:opacity-100 transition-opacity text-black">
            <span>{isExpanded ? 'Collapse' : 'Click to Expand'}</span>
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t-2 border-black/20 mt-2 text-black">
                  <div className="mb-4">
                    <p className="font-bold text-sm opacity-70">Issuer</p>
                    <p className="font-bold">{issuer}</p>
                  </div>
                  <div className="mb-4">
                    <p className="font-bold text-sm opacity-70">Credential</p>
                    <p className="font-bold">{title}</p>
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
                      <span className="text-green-600">✔</span> Verified Credential
                    </p>
                  </div>
                  
                  {pdf && (
                    <div className="pb-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-black text-white font-bold py-3 px-5 brutal-border hover:bg-white hover:text-black transition-colors w-full justify-center sm:w-auto"
                      >
                        <FaFilePdf /> View Certificate
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Decorative background shape */}
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
