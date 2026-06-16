import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { FaLinkedin, FaGithub, FaEnvelope, FaInstagram } from 'react-icons/fa';
import profileImg from '../../assets/images/profil.png';

export const ContactSection = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(''); // 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMessage('Please fill all required fields.');
      setStatus('error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const formPayload = new FormData();
      formPayload.append('access_key', import.meta.env.VITE_WEB3FORMS_ACCESS_KEY);
      formPayload.append('name', formData.name);
      formPayload.append('email', formData.email);
      formPayload.append('message', formData.message);
      formPayload.append('subject', 'Portfolio Contact Form Submission');
      
      const botcheck = e.target.elements.botcheck;
      if (botcheck && botcheck.checked) {
        setStatus('success');
        return;
      }

      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formPayload
      });

      const data = await res.json();
      
      if (data.success) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setStatus(''), 5000);
      } else {
        setStatus('error');
        setErrorMessage(data.message || 'Failed to send message. Please try again later.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('Failed to send message. Please try again later.');
    }
  };
  return (
    <Section id="contact" className="relative overflow-hidden pt-24 pb-20">
      
      {/* Desktop Blob Background (Unchanged, hidden on mobile) */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
        className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-40 z-0 pointer-events-none"
      >
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="#00E5FF" d="M43.6,-66.2C56.6,-57.4,67.2,-44.6,73.3,-30.2C79.3,-15.8,80.7,0.3,77.3,15.1C73.9,29.9,65.8,43.4,54.6,53.4C43.4,63.4,29.2,70,-15,70C-29.2,70,-43.4,63.4,-53.4,53.4C-63.4,43.4,-69.2,29.9,-72.1,15.1C-75,0.3,-75,-15.8,-69.5,-30.2C-64,-44.6,-53.1,-57.4,-40.1,-66.2C-27.1,-75,-13.6,-78.5,0.7,-79.6C15.1,-80.7,30.6,-75,43.6,-66.2Z" transform="translate(100 100)" />
        </svg>
      </motion.div>

      {/* Mobile Organic Background Shape (Solution A) */}
      {/* Positioned behind email, socials, and form. Inset from edges to prevent cropping. */}
      <div className="block lg:hidden absolute top-auto bottom-8 left-4 right-4 lg:left-6 lg:right-6 h-[65%] bg-primary/20 rounded-[40px_100px_40px_100px] z-0 pointer-events-none opacity-80" />

      {/* Small decorative mobile element (Solution C inspired) */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="block lg:hidden absolute top-[40%] right-8 w-12 h-12 bg-accent rounded-full border-2 border-black opacity-60 z-0 pointer-events-none"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 relative z-10">
        
        {/* Contact Info (Left Panel) */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center"
        >
          {/* Avatar and Availability Badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 lg:mb-8">
            <div className="w-20 h-20 rounded-full border-4 border-black brutal-shadow overflow-hidden bg-secondary shrink-0">
              <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 bg-white border-2 border-black rounded-full px-3 py-1 shadow-[2px_2px_0px_0px_var(--color-black)] w-fit">
                <span className="w-3 h-3 rounded-full bg-green-500 border border-black"></span>
                <span className="font-heading font-bold text-sm">Available for Freelance</span>
              </div>
              
              {/* Secondary badges (hidden on mobile to reduce clutter, visible on tablet+) */}
              <div className="hidden sm:flex flex-wrap gap-2">
                <div className="bg-accent border-2 border-black rounded-full px-3 py-1 shadow-[2px_2px_0px_0px_var(--color-black)] w-fit">
                  <span className="font-heading font-bold text-xs">⚡ Usually Replies Within 24 Hours</span>
                </div>
                <div className="bg-white border-2 border-black rounded-full px-3 py-1 shadow-[2px_2px_0px_0px_var(--color-black)] w-fit">
                  <span className="font-heading font-bold text-xs">📍 Indonesia</span>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-5xl md:text-7xl font-black mb-4 lg:mb-6 leading-[1.05]">
            LET'S<br/>TALK.
          </h2>
          <p className="text-lg md:text-xl font-medium mb-8 lg:mb-10 max-w-md text-gray-800 dark:text-gray-300 transition-colors duration-300 leading-relaxed">
            Have an exciting project or collaboration in mind? I'm always open to discussing product design work or partnership opportunities.
          </p>
          
          <div className="flex flex-col gap-4">
            <a 
              href="mailto:raihanazkahidayat90@gmail.com" 
              className="flex items-center gap-4 text-base sm:text-lg md:text-xl font-bold hover:text-primary transition-colors group w-fit"
              title="Send Email"
              aria-label="Send Email"
            >
              <span className="w-12 h-12 shrink-0 bg-white border-2 border-black flex items-center justify-center group-hover:-translate-y-1 transition-transform brutal-shadow">
                <FaEnvelope className="text-black" />
              </span>
              <span className="text-black break-all">raihanazkahidayat90@gmail.com</span>
            </a>
            
            <div className="flex gap-4 mt-4 lg:mt-6">
              {[
                { icon: <FaLinkedin />, link: "https://www.linkedin.com/in/raihan-azka-hidayat-355772341", color: "bg-[#00B4D8]", label: "Visit LinkedIn Profile" },
                { icon: <FaGithub />, link: "https://github.com/Rivayy20/", color: "bg-white", label: "Visit GitHub Profile" },
                { icon: <FaInstagram />, link: "https://www.instagram.com/azk.hy_/", color: "bg-[#FFD60A]", label: "Visit Instagram Profile" }
              ].map((social, idx) => (
                <a 
                  key={idx}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`relative w-14 h-14 ${social.color} brutal-border flex items-center justify-center text-2xl brutal-shadow-hover hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all group/icon`}
                >
                  <span className="text-black">{social.icon}</span>
                  {/* Custom Tooltip */}
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover/icon:opacity-100 group-hover/icon:-translate-y-1 transition-all pointer-events-none bg-black text-white text-xs font-bold px-3 py-1.5 brutal-border shadow-[2px_2px_0px_0px_var(--color-white)] whitespace-nowrap z-50">
                    {social.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Contact Form (Right Panel) */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 lg:mt-0"
        >
          <Card className="bg-accent p-6 md:p-10 lg:p-12 w-full">
            <form className="flex flex-col gap-5 lg:gap-6" onSubmit={handleSubmit}>
              <h3 className="text-2xl lg:text-3xl font-black mb-2">Send a Message</h3>
              
              <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />

              <Input 
                name="name"
                label="Your Name" 
                placeholder="John Doe" 
                value={formData.name}
                onChange={handleChange}
                required
                disabled={status === 'loading'}
              />
              
              <Input 
                name="email"
                label="Email Address" 
                type="email" 
                placeholder="john@example.com" 
                value={formData.email}
                onChange={handleChange}
                required
                disabled={status === 'loading'}
              />
              
              <Input 
                as="textarea"
                name="message"
                label="Message" 
                placeholder="Tell me about your project..." 
                rows={4}
                value={formData.message}
                onChange={handleChange}
                required
                disabled={status === 'loading'}
              />
              
              {status === 'error' && (
                <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 font-bold brutal-border mt-2">
                  ❌ {errorMessage}
                </div>
              )}
              {status === 'success' && (
                <div className="bg-green-100 border-2 border-green-500 text-green-800 px-4 py-3 font-bold brutal-border mt-2">
                  ✅ Message sent successfully!
                </div>
              )}

              <Button 
                type="submit" 
                variant="primary" 
                className={`mt-2 lg:mt-4 text-lg lg:text-xl py-3 lg:py-4 w-full transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed`}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? '⏳ Sending Message...' : 'Shoot Message'}
              </Button>
            </form>
          </Card>
        </motion.div>

      </div>
    </Section>
  );
};
