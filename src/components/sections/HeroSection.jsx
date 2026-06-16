import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { FaArrowDown } from 'react-icons/fa';
import { DocumentViewerModal } from '../ui/DocumentViewerModal';
import profileImg from '../../assets/images/profil.png';
import cvFile from '../../assets/cv/cv.pdf';
import { smoothScrollTo } from '../../utils/scrollTo';

export const HeroSection = () => {
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <section id="home" className="min-h-[85vh] flex flex-col justify-center relative pt-24 pb-8 md:pt-32 md:pb-20">
      <motion.div 
        className="flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-12 items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Content (Mobile Order 2, Desktop Order 1) */}
        <div className="flex flex-col gap-4 md:gap-6 z-10 order-2 lg:order-1 w-full mt-4 lg:mt-0">
          <motion.div variants={itemVariants} className="inline-block">
            <span className="brutal-badge bg-primary px-4 py-2 text-sm font-bold border-2 border-black">
              Hello, I'm a Developer & Designer
            </span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl leading-[1.05] md:text-5xl lg:text-7xl font-black lg:leading-[1.1]">
            Building Digital Experiences with <span className="text-secondary relative whitespace-nowrap">Logic<svg className="absolute w-full h-3 bottom-1 left-0 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="#FFD60A" strokeWidth="8" fill="transparent"/></svg></span> and <span className="text-primary relative whitespace-nowrap">Creativity<svg className="absolute w-full h-3 bottom-1 left-0 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 0 100 5" stroke="#00B4D8" strokeWidth="8" fill="transparent"/></svg></span>.
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-base md:text-lg lg:text-xl font-medium max-w-xl text-gray-800 dark:text-gray-300 leading-relaxed transition-colors duration-300">
            Information Systems Student at Telkom University with experience in Web Development, Game Development, and Creative Media.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4 w-full">
            <Button variant="accent" className="text-lg w-full h-14 sm:w-auto px-8 group" onClick={(e) => smoothScrollTo(e, '#projects')}>
              <span className="block transition-transform group-hover:-translate-y-1 group-hover:-translate-x-1 group-active:translate-y-1 group-active:translate-x-1">
                View My Projects
              </span>
            </Button>
            <Button variant="white" className="text-lg w-full h-14 sm:w-auto px-8 border-2 border-black group" onClick={() => setIsCVModalOpen(true)}>
              <span className="block transition-transform group-hover:-translate-y-1 group-hover:-translate-x-1 group-active:translate-y-1 group-active:translate-x-1">
                View CV
              </span>
            </Button>
          </motion.div>
        </div>

        {/* Right Visuals (Mobile Order 1, Desktop Order 2) */}
        <motion.div variants={itemVariants} className="relative w-full flex items-center justify-center order-1 lg:order-2 mt-12 lg:mt-0">
          
          {/* Main Image Card with Floating Animation */}
          <motion.div 
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
            className="relative z-10 w-full max-w-[260px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px] xl:max-w-[440px] aspect-[4/5] mx-auto"
          >
            {/* Image Container with built-in padding to zoom out portrait and protect face */}
            <div className="absolute inset-0 bg-secondary brutal-border brutal-shadow overflow-hidden group pt-6 px-3 sm:pt-10 sm:px-6 md:pt-12 md:px-8 flex items-end justify-center">
              <img 
                src={profileImg} 
                alt="Profile" 
                className="w-full h-[96%] sm:h-[98%] object-cover object-top grayscale-0 lg:grayscale lg:group-hover:grayscale-0 transition-all duration-500 origin-bottom scale-100 group-hover:scale-105" 
              />
            </div>
            
            {/* 1. Top Left: Telkom University (Small, Mobile Visible) */}
            <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-12 lg:-top-6 lg:-left-20 bg-white brutal-border px-3 py-1.5 shadow-[4px_4px_0px_0px_var(--color-black)] rotate-[-3deg] hover:-translate-y-1 hover:scale-105 transition-all z-30 flex items-center gap-2 cursor-default">
               <span className="text-base md:text-lg">🎓</span>
               <span className="font-heading font-black text-[10px] md:text-xs whitespace-nowrap">Telkom University</span>
            </div>

            {/* 2. Top Right: Ex Game Developer Intern (Medium, Mobile Visible) */}
            <div className="absolute top-8 -right-6 sm:top-12 sm:-right-16 lg:top-10 lg:-right-24 xl:-right-28 bg-accent brutal-border px-3 py-2 sm:px-4 sm:py-2 shadow-[4px_4px_0px_0px_var(--color-black)] rotate-[4deg] hover:-translate-y-1 hover:scale-105 transition-all z-30 flex items-center gap-2 cursor-default">
               <span className="text-base sm:text-lg">🎮</span>
               <span className="font-heading font-black text-[10px] sm:text-xs md:text-sm whitespace-nowrap">Ex Game Developer Intern</span>
            </div>

            {/* 3. Middle Left: Photographer (Small, Hidden on Mobile) */}
            <div className="hidden lg:flex absolute top-[45%] -translate-y-1/2 -left-16 lg:-left-24 xl:-left-28 bg-primary brutal-border px-3 py-1.5 shadow-[4px_4px_0px_0px_var(--color-black)] rotate-[-5deg] hover:-translate-y-1 hover:scale-105 transition-all z-30 items-center gap-2 cursor-default">
               <span className="text-base md:text-lg">📸</span>
               <span className="font-heading font-black text-xs whitespace-nowrap">Photographer</span>
            </div>

            {/* 4. Middle Right: Full Stack Developer (Medium, Hidden on Mobile) */}
            <div className="hidden lg:flex absolute top-[65%] -translate-y-1/2 -right-16 lg:-right-24 xl:-right-28 bg-white brutal-border px-4 py-2 shadow-[4px_4px_0px_0px_var(--color-black)] rotate-[2deg] hover:-translate-y-1 hover:scale-105 transition-all z-30 items-center gap-2 cursor-default">
               <span className="text-lg md:text-xl">💻</span>
               <span className="font-heading font-black text-xs md:text-sm whitespace-nowrap">Full Stack Developer</span>
            </div>

            {/* 5. Bottom Center: 5+ Months Industry Experience (Medium/Large, Mobile Visible) */}
            <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 -translate-x-1/2 bg-white brutal-border p-2 md:p-3 shadow-[4px_4px_0px_0px_var(--color-black)] rotate-[-2deg] hover:-translate-y-1 hover:scale-105 transition-all z-30 cursor-default flex flex-col items-center justify-center min-w-[200px] sm:min-w-[240px]">
              <p className="font-heading font-black text-xs sm:text-sm md:text-base whitespace-nowrap flex items-center justify-center gap-2">
                <span className="text-base md:text-lg">🚀</span> 5+ Months
              </p>
              <p className="font-body font-bold text-[10px] md:text-xs whitespace-nowrap text-gray-700 dark:text-gray-300 transition-colors duration-300">Industry Experience</p>
            </div>

          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.a 
        href="#about"
        onClick={(e) => smoothScrollTo(e, '#about')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="relative lg:absolute mt-12 lg:mt-0 bottom-auto lg:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 group cursor-pointer z-20"
      >
        <span className="text-xs font-bold uppercase tracking-widest group-hover:text-primary transition-colors">Scroll</span>
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-10 h-10 bg-white group-hover:bg-primary brutal-border rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_var(--color-black)] group-hover:shadow-[4px_4px_0px_0px_var(--color-black)] group-hover:-translate-y-1 transition-all"
        >
          <FaArrowDown className="text-black" />
        </motion.div>
      </motion.a>

      <DocumentViewerModal 
        isOpen={isCVModalOpen}
        onClose={() => setIsCVModalOpen(false)}
        pdfUrl={cvFile}
        title="My CV"
      />
    </section>
  );
};
