import { motion } from 'framer-motion';
import { FaCertificate } from 'react-icons/fa';
import { CertificationCard } from './CertificationCard';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { containerVariants, itemVariants } from '../../utils/motionVariants';

export const CertificationsSection = ({ expandedId, onToggle }) => {
  const { data } = usePortfolioData();
  const { about, certifications } = data;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
    >
      <div className="flex items-center gap-4 mb-6">
        <FaCertificate className="text-3xl text-primary" />
        <h3 className="text-2xl font-black">
          {about?.certificationsHeading || 'Certifications'}
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {certifications.map((cert, idx) => {
          const certId = cert.rowId || cert.id || `cert-${idx}`;
          return (
            <motion.div key={certId} variants={itemVariants}>
              <CertificationCard
                {...cert}
                id={cert.credentialCode || cert.id}
                isExpanded={expandedId === certId}
                onToggle={() => onToggle(certId)}
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
