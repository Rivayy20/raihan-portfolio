import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';
import { CertificationCard } from './CertificationCard';
import { FaGraduationCap, FaBriefcase, FaCertificate, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { certificationsData } from '../../data/certifications';

const EducationCard = ({ isExpanded, onToggle }) => {
  return (
    <Card 
      className={`bg-[#FFD60A] dark:bg-[#B8860B] flex flex-col justify-start cursor-pointer transition-all duration-300 ${isExpanded ? 'shadow-[6px_6px_0px_0px_var(--color-black)] -translate-y-1' : 'hover:-translate-y-2'}`}
      onClick={onToggle}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-white brutal-border flex items-center justify-center text-2xl text-black">
          <FaGraduationCap />
        </div>
      </div>
      
      <h3 className="text-xl font-black mb-2 text-black">Education</h3>
      <p className="font-bold text-lg leading-tight text-black">Bachelor of Information Systems</p>
      <p className="font-medium mt-2 text-black">Telkom University</p>
      <p className="text-sm font-bold opacity-70 mt-1 text-black">2025 - Present</p>

      <div className="mt-4 pt-4 flex items-center justify-between font-bold text-sm opacity-80 hover:opacity-100 transition-opacity text-black">
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
            <div className="pt-4 border-t-2 border-black/20 mt-2">
              <h4 className="font-black text-lg mb-4 text-black">Previous Education</h4>
              
              <div className="mb-4">
                <p className="font-bold text-base text-black">SMK Negeri 2 Magelang</p>
                <p className="text-sm font-medium text-black">Major: Pengembangan Perangkat Lunak dan Gim (PPLG)</p>
                <p className="text-sm font-bold opacity-70 mt-1 text-black">Graduation Year: 2025</p>
              </div>
              
              <div>
                <p className="font-bold text-base text-black">SMP Negeri 5 Magelang</p>
                <p className="text-sm font-bold opacity-70 mt-1 text-black">Graduation Year: 2022</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

const ExperienceCard = ({ isExpanded, onToggle }) => {
  return (
    <Card 
      className={`bg-[#00B4D8] dark:bg-[#00008B] flex flex-col justify-start cursor-pointer transition-all duration-300 ${isExpanded ? 'shadow-[6px_6px_0px_0px_var(--color-black)] -translate-y-1' : 'hover:-translate-y-2'}`}
      onClick={onToggle}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-white brutal-border flex items-center justify-center text-2xl text-black">
          <FaBriefcase />
        </div>
      </div>
      
      <h3 className="text-xl font-black mb-2 text-black">Experience</h3>
      <p className="font-bold text-lg leading-tight text-black">Game Developer (Intern)</p>
      <p className="font-medium mt-2 text-black">PT. Teknoreka Inovasi Nusantara</p>
      <p className="text-sm font-bold opacity-70 mt-1 text-black">5 Months Duration</p>

      <div className="mt-4 pt-4 flex items-center justify-between font-bold text-sm opacity-80 hover:opacity-100 transition-opacity text-black">
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
                <p className="font-bold text-sm opacity-70">Duration</p>
                <p className="font-bold">5 Months (December 2024 – May 2025)</p>
              </div>
              
              <div className="mb-4">
                <p className="font-bold text-sm opacity-70 mb-1">Responsibilities</p>
                <ul className="list-disc pl-5 font-medium text-sm space-y-1">
                  <li>Developing gameplay mechanics</li>
                  <li>Implementing UI systems</li>
                  <li>Testing game features</li>
                  <li>Debugging and optimization</li>
                </ul>
              </div>

              <div className="mb-4">
                <p className="font-bold text-sm opacity-70 mb-1">Tools Used</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-white/50 px-2 py-1 brutal-border text-xs font-bold text-black">Unity</span>
                  <span className="bg-white/50 px-2 py-1 brutal-border text-xs font-bold text-black">C#</span>
                  <span className="bg-white/50 px-2 py-1 brutal-border text-xs font-bold text-black">Blender</span>
                </div>
              </div>

              <div>
                <p className="font-bold text-sm opacity-70 mb-1">Key Achievements</p>
                <ul className="list-disc pl-5 font-medium text-sm space-y-1">
                  <li>Built interactive modules</li>
                  <li>Improved gameplay systems</li>
                  <li>Contributed to production workflows</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};


export const AboutSection = () => {
  const [expandedCard, setExpandedCard] = useState(null);

  const handleToggle = (cardId) => {
    setExpandedCard(prev => prev === cardId ? null : cardId);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <Section 
      id="about" 
      title="About Me" 
      subtitle="Combining logic with creativity to build memorable digital solutions."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Personal Narrative */}
        <motion.div 
          className="lg:col-span-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={itemVariants}
        >
          <Card className="h-full bg-base">
            <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-accent brutal-border flex items-center justify-center rounded-full text-lg">!</span>
              The Narrative
            </h3>
            <div className="space-y-4 text-lg font-medium text-gray-800 dark:text-gray-300 transition-colors duration-300">
              <p>
                My journey into technology started with a simple curiosity about how games are made. That curiosity quickly evolved into a passion for software engineering, game development, and creating seamless digital experiences.
              </p>
              <p>
                As an Information Systems student, I've learned to bridge the gap between technical execution and business value. I don't just write code; I design systems that solve real problems while maintaining an engaging user experience.
              </p>
              <p>
                Whether I'm developing a web application, crafting a 3D game environment, or optimizing a backend database, my goal is always the same: <span className="font-bold text-black bg-secondary/30 px-1">Build something that matters.</span>
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Credibility Pillars */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* Education & Experience Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Education */}
            <motion.div variants={itemVariants}>
              <EducationCard 
                isExpanded={expandedCard === 'edu'}
                onToggle={() => handleToggle('edu')}
              />
            </motion.div>

            {/* Experience */}
            <motion.div variants={itemVariants}>
              <ExperienceCard 
                isExpanded={expandedCard === 'exp'}
                onToggle={() => handleToggle('exp')}
              />
            </motion.div>
          </motion.div>

          {/* Certifications Section */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-start">
              {certificationsData.map((cert, idx) => (
                <motion.div key={cert.id || idx} variants={itemVariants}>
                  <CertificationCard 
                    {...cert}
                    isExpanded={expandedCard === (cert.id || `cert${idx}`)}
                    onToggle={() => handleToggle(cert.id || `cert${idx}`)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
};
