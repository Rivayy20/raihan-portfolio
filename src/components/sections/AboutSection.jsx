import React, { useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';
import { ExperienceSummary } from './ExperienceSummary';
import { ExperiencePanel } from './ExperiencePanel';
import { CertificationsSection } from './CertificationsSection';
import { FaGraduationCap, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { containerVariants, itemVariants } from '../../utils/motionVariants';

const EducationCard = ({ isExpanded, onToggle }) => {
  return (
    <Card 
      className={`bg-[#FDE047] dark:bg-[#B8860B] flex flex-col justify-start cursor-pointer transition-all duration-300 ${isExpanded ? 'shadow-[6px_6px_0px_0px_var(--color-black)] -translate-y-1' : 'hover:-translate-y-2'}`}
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

export const AboutSection = () => {
  const [expandedCard, setExpandedCard] = useState(null);
  const experiencePanelId = useId();

  const handleToggle = (cardId) => {
    setExpandedCard(prev => prev === cardId ? null : cardId);
  };

  return (
    <Section 
      id="about" 
      title="About Me" 
      subtitle="Combining logic with creativity to build memorable digital solutions."
    >
      <div className="flex flex-col">
        {/* About Overview: every card sizes to its own content (items-start),
            so no card absorbs the height of another. */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-start">
          {/* Personal Narrative */}
          <motion.div 
            className="md:col-span-2 lg:col-span-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={itemVariants}
          >
            <Card className="bg-base">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-accent brutal-border flex items-center justify-center rounded-full text-lg">!</span>
                The Narrative
              </h3>
              <div className="space-y-4 text-lg font-medium text-left text-gray-800 dark:text-gray-300 transition-colors duration-300">
                <p>
                  An undergraduate Information Systems student at Telkom University with a background in Software Engineering and experience as a Game Developer Intern.
                </p>
                <p>
                  Possesses knowledge and hands-on experience in game development using Unity and Blender, as well as web development, software development, database management, and technologies such as React, Laravel, PHP, and MySQL, developed through academic learning and professional experience.
                </p>
                <p>
                  Skilled in application development, programming, database management, and the use of various software development tools. Demonstrates strong analytical thinking, problem-solving, attention to detail, communication, and learning abilities.
                </p>
                <p>
                  Interested in continuously developing expertise and contributing to the fields of information technology, software development, game development, web development, database management, and related areas.
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Education & Experience summary */}
          <motion.div
            className="md:col-span-2 lg:col-span-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8 items-start"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={itemVariants}>
              <EducationCard 
                isExpanded={expandedCard === 'edu'}
                onToggle={() => handleToggle('edu')}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <ExperienceSummary
                isExpanded={expandedCard === 'exp'}
                onToggle={() => handleToggle('exp')}
                panelId={experiencePanelId}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Full-width Experience Details, outside the overview grid */}
        <ExperiencePanel id={experiencePanelId} isOpen={expandedCard === 'exp'} />

        <div className="pt-12">
          <CertificationsSection
            expandedId={expandedCard}
            onToggle={handleToggle}
          />
        </div>
      </div>
    </Section>
  );
};
