import React from 'react';
import { FaLinkedin, FaGithub, FaInstagram } from 'react-icons/fa';
import { smoothScrollTo } from '../../utils/scrollTo';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { name: 'Home', href: '#', id: 'home' },
    { name: 'About', href: '#about', id: 'about' },
    { name: 'Expertise', href: '#expertise', id: 'expertise' },
    { name: 'Projects', href: '#projects', id: 'projects' },
    { name: 'Creative', href: '#creative-corner', id: 'creative-corner' },
    { name: 'Contact', href: '#contact', id: 'contact' }
  ];

  const socialLinks = [
    { icon: <FaLinkedin />, url: 'https://www.linkedin.com/in/raihan-azka-hidayat-355772341', label: 'LinkedIn' },
    { icon: <FaGithub />, url: 'https://github.com/Rivayy20', label: 'GitHub' },
    { icon: <FaInstagram />, url: 'https://instagram.com/azk.hy_', label: 'Instagram' }
  ];

  return (
    <footer className="w-full bg-base text-black pt-16 pb-8 px-6 md:px-12 border-t-8 border-black relative overflow-hidden">
      {/* Subtle Pattern Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Top Grid Area */}
        <div className="flex flex-col md:flex-row justify-between gap-12 text-center md:text-left mb-16">
          
          {/* Column 1: Brand Identity */}
          <div className="flex flex-col items-center md:items-start gap-4 flex-1">
            <span className="font-heading font-black text-5xl tracking-tighter uppercase text-primary drop-shadow-[3px_3px_0px_var(--color-black)]">
              RH.
            </span>
            <p className="font-bold text-lg md:text-xl max-w-xs leading-snug">
              Building Digital Experiences with Logic and Creativity.
            </p>
            {/* Availability Badge */}
            <div className="inline-flex items-center gap-3 bg-white brutal-border px-4 py-2 shadow-[4px_4px_0px_0px_var(--color-black)] mt-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border border-black"></span>
              </span>
              <span className="font-black text-sm uppercase tracking-wide">Available for Freelance</span>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="flex flex-col items-center md:items-start flex-1 md:pl-12 lg:pl-24">
            <h4 className="font-black text-xl mb-6 uppercase border-b-4 border-primary inline-block pb-1">Quick Links</h4>
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a 
                  key={link.id} 
                  href={link.href} 
                  onClick={(e) => smoothScrollTo(e, link.href)}
                  className="font-bold text-lg hover:text-primary hover:translate-x-2 transition-transform inline-flex w-fit mx-auto md:mx-0"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </div>

          {/* Column 3: Connect */}
          <div className="flex flex-col items-center md:items-start flex-1">
            <h4 className="font-black text-xl mb-6 uppercase border-b-4 border-secondary inline-block pb-1">Connect</h4>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <a 
                  key={index} 
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-12 h-12 bg-white brutal-border shadow-[4px_4px_0px_0px_var(--color-black)] flex items-center justify-center text-2xl hover:bg-black hover:text-white hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--color-black)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_var(--color-black)] transition-all"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          
        </div>

        {/* Divider */}
        <hr className="border-t-4 border-black mb-8" />

        {/* Bottom Area: Copyright & Tech Badges */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-bold text-sm text-center md:text-left">
            © {currentYear} Raihan Azka Hidayat. <br className="md:hidden" />
            All Rights Reserved.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            <span className="bg-white px-3 py-1 brutal-border text-xs sm:text-sm font-bold shadow-[2px_2px_0px_0px_var(--color-black)]">
              Built with React + Vite
            </span>
            <span className="bg-[#FFD60A] px-3 py-1 brutal-border text-xs sm:text-sm font-bold shadow-[2px_2px_0px_0px_var(--color-black)]">
              Designed in Neo-Brutalist Style
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
