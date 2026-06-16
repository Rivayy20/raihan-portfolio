import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';
import { skillsData } from '../../data/skills';

// Icon imports
import { 
  FaReact, FaPhp, FaBootstrap, FaHtml5, FaCss3Alt, 
  FaUnity, FaPython, FaNetworkWired, FaRobot 
} from 'react-icons/fa';
import { TbBrandNextjs, TbBrandCSharp } from 'react-icons/tb';
import { IoLogoJavascript } from 'react-icons/io5';
import { 
  SiTailwindcss, SiBlender, SiMysql, 
  SiDbeaver, SiSupabase, SiFirebase, SiCisco, SiPhpmyadmin
} from 'react-icons/si';
import { MdSecurity } from 'react-icons/md';

// Icon mapping
const iconMap = {
  FaReact, TbBrandNextjs, FaPhp, IoLogoJavascript, SiTailwindcss, FaBootstrap, FaHtml5, FaCss3Alt,
  FaUnity, TbBrandCSharp, SiBlender,
  FaPython, SiMysql, SiDbeaver, SiSupabase, SiFirebase,
  MdSecurity, FaNetworkWired, FaRobot, SiCisco, SiPhpmyadmin
};

const SkillBadge = ({ skill, type, isActive, onActivate, onDeactivate, onClick, accent }) => {
  const IconComponent = iconMap[skill.icon];
  const isExploring = type === 'exploring';
  const isPrimary = type === 'primary';
  
  return (
    <div 
      className="relative"
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
    >
      <motion.button 
        whileHover={{ scale: 1.05, y: -4 }}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={`relative flex items-center gap-2 brutal-border px-3 py-1.5 md:px-4 md:py-2 transition-all duration-300 cursor-pointer shadow-[4px_4px_0px_0px_var(--color-black)] hover:shadow-[6px_6px_0px_0px_var(--color-black)] ${
          isPrimary ? 'bg-black text-white' : `bg-white text-black ${accent === 'yellow' ? 'hover:bg-[#FFD60A]' : 'hover:bg-primary'}`
        }`}
      >
        {IconComponent && <IconComponent className="text-lg md:text-xl" />}
        <span className={`font-bold whitespace-nowrap ${isPrimary ? 'text-sm md:text-base' : 'text-xs md:text-sm'}`}>
          {skill.name}
        </span>
        
        {isExploring && (
          <span className="absolute -top-3 -right-3 bg-accent text-black text-[9px] font-black px-1.5 py-0.5 brutal-border rotate-[15deg]">
            LEARNING
          </span>
        )}
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {isActive && skill.projects && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 sm:w-56 bg-white brutal-border p-3 shadow-[4px_4px_0px_0px_var(--color-black)] pointer-events-none"
          >
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-4 border-r-4 border-black rotate-45"></div>
            <p className="text-xs font-bold opacity-70 mb-2 uppercase tracking-wider text-black relative z-10">Used In:</p>
            <ul className="space-y-1 relative z-10">
              {skill.projects.map((project, idx) => (
                <li key={idx} className="text-sm font-bold flex items-start gap-2 text-black leading-tight">
                  <span className="text-primary mt-0.5">▶</span> {project}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SkillsSection = () => {
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveTooltip(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <Section 
      id="expertise" 
      title="Core Expertise" 
      subtitle="The tools and technologies I use to build digital experiences."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {skillsData.map((category, idx) => (
          <motion.div
            key={idx}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="h-full"
          >
            <Card className={`h-full flex flex-col ${category.color} ${category.color === 'bg-white' ? '' : 'text-black'}`}>
              <h3 className={`text-2xl font-black mb-6 border-b-4 pb-2 inline-block self-start ${category.accent === 'yellow' ? 'border-[#FFD60A]' : 'border-black'}`}>
                {category.category}
              </h3>
              
              {/* Primary Stack */}
              {category.primary && (
                <div className="mb-8">
                  <h4 className="text-xs font-bold opacity-70 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${category.accent === 'yellow' ? 'bg-[#FFD60A]' : 'bg-black'}`}></span> Primary Stack
                  </h4>
                  <div className="flex flex-wrap gap-3 md:gap-4">
                    {category.primary.map((skill, skillIdx) => (
                      <motion.div key={skillIdx} variants={itemVariants}>
                        <SkillBadge 
                          skill={skill} 
                          type="primary"
                          isActive={activeTooltip === skill.name}
                          onActivate={() => setActiveTooltip(skill.name)}
                          onDeactivate={() => setActiveTooltip(null)}
                          onClick={() => setActiveTooltip(activeTooltip === skill.name ? null : skill.name)}
                          accent={category.accent}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Supporting Stack */}
              {category.supporting && (
                <div className="mt-auto">
                  <h4 className="text-xs font-bold opacity-70 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <span className={`w-2 h-2 bg-white border-2 rounded-full ${category.accent === 'yellow' ? 'border-[#FFD60A]' : 'border-black'}`}></span> Supporting
                  </h4>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {category.supporting.map((skill, skillIdx) => (
                      <motion.div key={skillIdx} variants={itemVariants}>
                        <SkillBadge 
                          skill={skill} 
                          type="supporting"
                          isActive={activeTooltip === skill.name}
                          onActivate={() => setActiveTooltip(skill.name)}
                          onDeactivate={() => setActiveTooltip(null)}
                          onClick={() => setActiveTooltip(activeTooltip === skill.name ? null : skill.name)}
                          accent={category.accent}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Currently Exploring */}
              {category.exploring && (
                <div className="mt-2">
                  <h4 className="text-xs font-bold opacity-70 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${category.accent === 'yellow' ? 'bg-[#FFD60A]' : 'bg-black'}`}></span> Networking & Infrastructure
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {category.exploring.map((skill, skillIdx) => (
                      <motion.div key={skillIdx} variants={itemVariants}>
                        <SkillBadge 
                          skill={skill} 
                          type="exploring"
                          isActive={activeTooltip === skill.name}
                          onActivate={() => setActiveTooltip(skill.name)}
                          onDeactivate={() => setActiveTooltip(null)}
                          onClick={() => setActiveTooltip(activeTooltip === skill.name ? null : skill.name)}
                          accent={category.accent}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};
