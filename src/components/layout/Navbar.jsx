import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { FaMoon, FaSun, FaBars, FaTimes } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeProvider';
import { DocumentViewerModal } from '../ui/DocumentViewerModal';
import cvFile from '../../assets/cv/cv.pdf';
import { smoothScrollTo } from '../../utils/scrollTo';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -60% 0px',
      threshold: 0,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Give components time to mount before observing
    setTimeout(() => {
      const sections = document.querySelectorAll('section[id]');
      sections.forEach((sec) => observer.observe(sec));
    }, 500);

    const handleScrollTop = () => {
       if (window.scrollY < 100) setActiveSection('home');
    };
    window.addEventListener('scroll', handleScrollTop);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScrollTop);
    };
  }, []);

  const navLinks = [
    { name: 'Home', href: '#', id: 'home' },
    { name: 'About', href: '#about', id: 'about' },
    { name: 'Expertise', href: '#expertise', id: 'expertise' },
    { name: 'Projects', href: '#projects', id: 'projects' },
    { name: 'Creative', href: '#creative-corner', id: 'creative-corner' },
    { name: 'Contact', href: '#contact', id: 'contact' },
  ];

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'py-4' : 'py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="bg-white border-[3px] border-black brutal-shadow rounded-xl flex items-center justify-between px-4 md:px-6 py-3">
            
            {/* Logo */}
            <div className="flex-shrink-0 cursor-pointer" onClick={(e) => smoothScrollTo(e, '#')}>
              <span className="font-heading font-black text-2xl tracking-tighter hover:text-primary transition-colors">
                RH
              </span>
            </div>

            {/* Center Links (Desktop) */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <a 
                    key={link.name} 
                    href={link.href}
                    onClick={(e) => smoothScrollTo(e, link.href)}
                    className={`font-body text-lg transition-transform relative group ${
                      isActive ? 'font-black text-secondary -translate-y-1' : 'font-bold text-black hover:text-secondary hover:-translate-y-1'
                    }`}
                  >
                    {link.name}
                    <span className={`absolute -bottom-1 left-0 h-1 bg-accent transition-all ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
                  </a>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 md:gap-4">
              <button 
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-black brutal-shadow-hover bg-white hover:-translate-y-1 transition-all"
                aria-label="Toggle Dark Mode"
              >
                {theme === 'dark' ? <FaSun className="text-black" /> : <FaMoon className="text-black" />}
              </button>
              <Button variant="accent" className="hidden lg:flex py-2 px-6 text-sm" onClick={(e) => smoothScrollTo(e, '#contact')}>
                Hire Me
              </Button>
              {/* Mobile Menu Toggle */}
              <button 
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-md border-2 border-black bg-white brutal-shadow-hover"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <FaTimes className="text-black" /> : <FaBars className="text-black" />}
              </button>
            </div>

          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-4 top-24 z-40 lg:hidden"
          >
            <div className="bg-white border-[3px] border-black brutal-shadow rounded-xl p-6 flex flex-col gap-4">
              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => {
                      setIsMobileMenuOpen(false);
                      smoothScrollTo(e, link.href);
                    }}
                    className={`font-heading text-xl border-b-2 py-2 transition-colors flex flex-col relative ${
                      isActive ? 'font-black text-secondary border-transparent' : 'font-bold text-black border-transparent hover:border-black'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-1 bg-accent"></span>
                    )}
                  </a>
                );
              })}
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t-2 border-black border-dashed">
                <Button variant="accent" className="w-full py-4 text-lg" onClick={(e) => { setIsMobileMenuOpen(false); smoothScrollTo(e, '#contact'); }}>
                  Hire Me
                </Button>
                <Button variant="white" className="w-full py-4 text-lg border-2 border-black" onClick={() => { setIsMobileMenuOpen(false); setIsCVModalOpen(true); }}>
                  View CV
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DocumentViewerModal 
        isOpen={isCVModalOpen}
        onClose={() => setIsCVModalOpen(false)}
        pdfUrl={cvFile}
        title="My CV"
      />
    </>
  );
};
