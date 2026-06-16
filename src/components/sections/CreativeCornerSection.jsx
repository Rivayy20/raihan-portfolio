import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';
import { Lightbox } from '../ui/Lightbox';

// Image Imports
import feat1 from '../../assets/images/landscape-featured-1.webp';
import land1 from '../../assets/images/landscape-1.webp';
import land2 from '../../assets/images/landscape-2.webp';
import land3 from '../../assets/images/landscape-3.webp';
import land4 from '../../assets/images/landscape-4.webp';
import land5 from '../../assets/images/landscape-5.webp';
import land6 from '../../assets/images/landscape-6.webp';
import star1 from '../../assets/images/star-1.webp';

// Dummy Projects for Lightbox context
const featuredProject = {
  title: "Sunrise at Borobudur",
  subtitle: "Landscape Photography",
  images: [feat1]
};

const landscapeProject = {
  title: "Landscape Collection",
  subtitle: "Nature & Environment",
  images: [land1, land2, land3, land4, land5, land6]
};

const astroProject = {
  title: "Astrophotography",
  subtitle: "Night Sky Wonders",
  images: [star1]
};

const stats = [
  { value: '35+', label: 'Photos Captured', color: 'bg-[#FFD60A]', text: 'text-black' },
  { value: '15+', label: 'Events Documented', color: 'bg-primary', text: 'text-black' },
  { value: '3+', label: 'Years Exploring', color: 'bg-black', text: 'text-white' }
];

export const CreativeCornerSection = () => {
  const [lightboxData, setLightboxData] = useState({ project: null, activeIndex: 0, isOpen: false });

  const openLightbox = (project, index) => {
    setLightboxData({ project, activeIndex: index, isOpen: true });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <Section 
      id="creative-corner" 
      title="Creative Corner" 
      subtitle="Framing moments, capturing stories, exploring perspectives."
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {/* 1. Storytelling Introduction */}
        <motion.div variants={itemVariants} className="mb-12 md:mb-16 max-w-3xl">
          <p className="text-xl md:text-2xl font-bold leading-relaxed border-l-4 border-primary pl-4 md:pl-6 text-black">
            Outside of software development, I enjoy capturing stories through photography.
          </p>
          <p className="text-lg font-medium mt-4 opacity-80 pl-4 md:pl-6 text-black">
            This creative pursuit helps strengthen my visual thinking, attention to detail, and design perspective, translating perfectly into building better user interfaces.
          </p>
        </motion.div>

        {/* 2. Featured Shot (Full Width) */}
        <div className="mb-16 md:mb-24">
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-4 mb-6">
              <h3 className="text-2xl md:text-3xl font-black text-black">Featured Highlight</h3>
              <div className="h-1 flex-1 bg-black/20 border-t-2 border-dashed border-black hidden sm:block"></div>
            </div>
            
            <div 
              className="relative w-full aspect-[4/3] sm:aspect-video lg:aspect-[21/9] brutal-border overflow-hidden cursor-zoom-in group bg-white shadow-[6px_6px_0px_0px_var(--color-black)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_var(--color-black)] transition-all"
              onClick={() => openLightbox(featuredProject, 0)}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors z-10 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 bg-white text-black font-bold px-4 py-2 brutal-border scale-90 group-hover:scale-100 transition-all pointer-events-none shadow-[2px_2px_0px_0px_var(--color-black)]">🔍 View Full Image</span>
              </div>
              <img 
                src={feat1} 
                alt="Landscape Featured Photography" 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transform-gpu will-change-transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </motion.div>
        </div>

        {/* 3. Dedicated Photography Gallery */}
        <motion.div variants={itemVariants} className="mb-16 md:mb-24">
          <div className="flex items-center gap-4 mb-8">
            <h3 className="text-2xl md:text-3xl font-black text-black border-b-4 border-black pb-2 inline-block">
              Landscape Gallery
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {landscapeProject.images.map((imgSrc, idx) => (
              <div 
                key={idx} 
                className="relative aspect-[4/5] sm:aspect-square brutal-border overflow-hidden cursor-zoom-in group bg-white shadow-[4px_4px_0px_0px_var(--color-black)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--color-black)] transition-all"
                onClick={() => openLightbox(landscapeProject, idx)}
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors z-10 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 bg-white text-black font-bold px-3 py-1 brutal-border scale-90 group-hover:scale-100 transition-all pointer-events-none shadow-[2px_2px_0px_0px_var(--color-black)]">🔍 Preview</span>
                </div>
                <img 
                  src={imgSrc} 
                  alt={`Landscape Photography ${idx + 1}`} 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transform-gpu will-change-transform group-hover:scale-[1.03] transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* 4. Astrophotography */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-4 mb-8">
            <h3 className="text-2xl md:text-3xl font-black text-black border-b-4 border-black pb-2 inline-block">
              Astrophotography
            </h3>
          </div>
          
          <div 
            className="relative w-full max-w-4xl mx-auto aspect-[4/3] sm:aspect-video brutal-border overflow-hidden cursor-zoom-in group bg-black shadow-[6px_6px_0px_0px_var(--color-black)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_var(--color-black)] transition-all"
            onClick={() => openLightbox(astroProject, 0)}
          >
            <div className="absolute inset-0 bg-black/0 group-hover:bg-white/10 transition-colors z-10 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 bg-white text-black font-bold px-4 py-2 brutal-border scale-90 group-hover:scale-100 transition-all pointer-events-none shadow-[2px_2px_0px_0px_var(--color-black)]">✨ View Astrophotography</span>
            </div>
            <img 
              src={star1} 
              alt="Astrophotography Night Sky" 
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transform-gpu will-change-transform group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </motion.div>

        {/* 5. Creative Statistics */}
        <motion.div variants={itemVariants} className="mt-20 md:mt-24">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map((stat, idx) => (
              <motion.div key={idx} variants={itemVariants} className="h-full">
                <Card className={`${stat.color} flex flex-col items-center justify-center text-center p-8 hover:-translate-y-2 transition-transform duration-300 h-full`}>
                  <h4 className={`text-5xl md:text-6xl font-black mb-2 ${stat.text}`}>{stat.value}</h4>
                  <p className={`font-bold text-base md:text-lg opacity-90 ${stat.text}`}>{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </motion.div>

      {lightboxData.isOpen && (
        <Lightbox 
          lightboxData={lightboxData} 
          setLightboxData={setLightboxData} 
        />
      )}
    </Section>
  );
};
