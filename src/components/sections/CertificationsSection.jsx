import { motion } from 'framer-motion';
import { FaCertificate } from 'react-icons/fa';
import { CertificationCard } from './CertificationCard';
import { certificationsData } from '../../data/certifications';
import { containerVariants, itemVariants } from '../../utils/motionVariants';

// Full-width certifications block. Accordion state is owned by the parent so
// only one About card is open at a time.
export const CertificationsSection = ({ expandedId, onToggle }) => (
  <motion.div
    variants={containerVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
  >
    <div className="flex items-center gap-4 mb-6">
      <FaCertificate className="text-3xl text-primary" />
      <h3 className="text-2xl font-black">Certifications</h3>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
      {certificationsData.map((cert, idx) => {
        const certId = cert.id || `cert${idx}`;
        return (
          <motion.div key={certId} variants={itemVariants}>
            <CertificationCard
              {...cert}
              isExpanded={expandedId === certId}
              onToggle={() => onToggle(certId)}
            />
          </motion.div>
        );
      })}
    </div>
  </motion.div>
);
