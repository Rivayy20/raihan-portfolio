import { createElement, Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  FaArrowRight,
  FaCheck,
  FaClock,
  FaEnvelope,
  FaMapMarkerAlt,
  FaRegCopy,
  FaSpinner,
} from 'react-icons/fa';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { getSocialLinkColor } from '../../constants/colorPresets';
import { getSocialIconComponent } from '../../utils/socialIcons';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { EDITORIAL_EASE } from '../../utils/motionVariants';

function renderAccentHeading(text = "LET'S\nTALK.") {
  const parts = String(text).split(/(talk\.?)/i);
  if (parts.length <= 1) return text;

  return parts.map((part, idx) =>
    /^talk\.?$/i.test(part) ? (
      <span key={idx} className="sunset-text-accent">
        {part}
      </span>
    ) : (
      <Fragment key={idx}>{part}</Fragment>
    )
  );
}

export const ContactSection = () => {
  const { data } = usePortfolioData();
  const { contact, socialLinks, hero, settings } = data;
  const reduceMotion = useReducedMotion();

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const copyTimerRef = useRef(null);
  const statusTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
      if (statusTimerRef.current) window.clearTimeout(statusTimerRef.current);
    };
  }, []);

  const visibleSocials = useMemo(
    () =>
      (socialLinks || []).filter(
        (item) => item.showInContact && item.isVisible !== false
      ),
    [socialLinks]
  );

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCopyEmail = async () => {
    if (!contact?.email) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(contact.email);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = contact.email;
        textArea.setAttribute('readonly', '');
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopiedEmail(true);
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopiedEmail(false), 2200);
    } catch {
      // Fail silently if clipboard permissions are blocked
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        body: formPayload,
      });

      const resData = await res.json();

      if (resData.success) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        if (statusTimerRef.current) window.clearTimeout(statusTimerRef.current);
        statusTimerRef.current = window.setTimeout(() => setStatus(''), 5000);
      } else {
        setStatus('error');
        setErrorMessage(
          resData.message || 'Failed to send message. Please try again later.'
        );
      }
    } catch {
      setStatus('error');
      setErrorMessage('Failed to send message. Please try again later.');
    }
  };

  const avatarSrc = hero?.profileImageUrl || settings?.profileImageUrl;
  const showForm = contact?.showContactForm !== false;
  const submitLabel =
    contact?.formSubmitLabel && contact.formSubmitLabel !== 'Shoot Message'
      ? contact.formSubmitLabel
      : 'Send Message';

  const reveal = (delay = 0, { y = 14, x = 0, scale = 1, blur = false, duration = 0.72 } = {}) => ({
    hidden: reduceMotion
      ? { opacity: 0 }
      : {
          opacity: 0,
          y,
          x,
          scale,
          ...(blur ? { filter: 'blur(6px)' } : {}),
        },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      ...(blur ? { filter: 'blur(0px)' } : {}),
      transition: {
        duration: reduceMotion ? 0.2 : duration,
        delay: reduceMotion ? 0 : delay,
        ease: EDITORIAL_EASE,
      },
    },
  });

  const socialRowVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.08,
        delayChildren: reduceMotion ? 0 : 0.52,
      },
    },
  };

  const socialItemVariants = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0.18 : 0.55, ease: EDITORIAL_EASE },
    },
  };

  const formCardVariants = reveal(0.14, { y: 0, x: 24, duration: 0.82 });

  return (
    <section
      id="contact"
      className="relative py-20 sm:py-28 md:py-32 scroll-mt-24 overflow-x-clip"
    >
      {/* Subtle Background Depth: Left Coral Radial Glow + Soft Dot Texture + Twilight Glow */}
      <div
        aria-hidden="true"
        className="hero-dot-pattern pointer-events-none absolute inset-0 opacity-45 -z-20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-16 -left-16 w-80 sm:w-110 h-80 sm:h-110 rounded-full opacity-22 dark:opacity-18 blur-3xl -z-10"
        style={{
          background:
            'radial-gradient(circle, rgba(255,107,107,0.38), rgba(244,143,177,0.20) 52%, transparent 80%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 right-0 w-80 sm:w-110 h-80 sm:h-110 rounded-full opacity-18 dark:opacity-15 blur-3xl -z-10"
        style={{
          background:
            'radial-gradient(circle, rgba(255,179,138,0.36), rgba(244,143,177,0.18) 48%, rgba(73,52,95,0.16) 78%, transparent 100%)',
        }}
      />

      <div className="flex flex-col gap-12 sm:gap-14">
        {/* Hairline Section Label */}
        <motion.div
          variants={reveal(0, { y: 12, duration: 0.65 })}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="border-t border-border-subtle pt-8 max-w-3xl"
        >
          <span className="inline-flex items-center gap-2 font-body text-xs font-medium uppercase tracking-[0.2em] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            04 / Contact
          </span>
        </motion.div>

        <div
          className={`grid grid-cols-1 ${
            showForm ? 'lg:grid-cols-12' : 'max-w-2xl'
          } gap-10 lg:gap-14 items-start`}
        >
          {/* Left Editorial Info Column */}
          <div
            className={
              showForm ? 'lg:col-span-5 flex flex-col gap-7' : 'flex flex-col gap-7'
            }
          >
            {/* Stage 2 & 3: Profile Avatar + Pulsing Availability & Meta */}
            <div className="flex items-center gap-4">
              {avatarSrc && (
                <motion.div
                  variants={reveal(0.08, { y: 0, scale: 0.9, duration: 0.68 })}
                  initial={reduceMotion ? false : 'hidden'}
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  className="w-15 h-15 rounded-full bg-linear-to-tr from-primary/60 via-secondary/50 to-lavender/50 p-0.5 shrink-0 shadow-xs"
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-surface-subtle ring-1 ring-canvas">
                    <img
                      src={avatarSrc}
                      alt={`${settings?.fullName || 'RAZH'} - Contact Profile`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </motion.div>
              )}

              <motion.div
                variants={reveal(0.16, { y: 10, duration: 0.68 })}
                initial={reduceMotion ? false : 'hidden'}
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="flex flex-col gap-1.5 min-w-0"
              >
                {contact?.showAvailability !== false && contact?.availabilityStatus && (
                  <div className="inline-flex items-center gap-2 text-xs font-medium text-ink">
                    <span className="relative flex h-2.5 w-2.5 items-center justify-center shrink-0">
                      {contact.isAvailable !== false && !reduceMotion && (
                        <span
                          aria-hidden="true"
                          style={{ animationDuration: '2.6s' }}
                          className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50 animate-ping"
                        />
                      )}
                      <span
                        className={`relative inline-flex h-2 w-2 rounded-full ${
                          contact.isAvailable !== false
                            ? 'bg-emerald-500'
                            : 'bg-amber-400'
                        }`}
                      />
                    </span>
                    <span>{contact.availabilityStatus}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                  {contact?.showResponseTime !== false && contact?.responseTimeText && (
                    <span className="inline-flex items-center gap-1.5">
                      <FaClock aria-hidden="true" className="text-[10px]" />
                      {contact.responseTimeText}
                    </span>
                  )}
                  {contact?.showLocation !== false && contact?.locationText && (
                    <span className="inline-flex items-center gap-1.5">
                      <FaMapMarkerAlt aria-hidden="true" className="text-[10px]" />
                      {contact.locationText}
                    </span>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Stage 4 & 5: Heading & Supporting Description */}
            <div>
              <motion.h2
                variants={reveal(0.24, { y: 16, blur: true, duration: 0.84 })}
                initial={reduceMotion ? false : 'hidden'}
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="font-heading text-4xl sm:text-5xl xl:text-[3.35rem] font-medium tracking-[-0.03em] leading-[1.04] text-ink whitespace-pre-line"
              >
                {renderAccentHeading(
                  contact?.heading || "Have a project in mind?\nLet's talk."
                )}
              </motion.h2>

              {contact?.description && (
                <motion.p
                  variants={reveal(0.34, { y: 14, duration: 0.76 })}
                  initial={reduceMotion ? false : 'hidden'}
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  className="font-body text-sm sm:text-base text-muted mt-4 leading-[1.78] max-w-[44ch]"
                >
                  {contact.description}
                </motion.p>
              )}
            </div>

            {/* Stage 6 & 7: Interactive Email Card & Social Media Row */}
            <div className="space-y-5 pt-1">
              {contact?.email && (
                <motion.div
                  variants={reveal(0.42, { y: 14, duration: 0.72 })}
                  initial={reduceMotion ? false : 'hidden'}
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <div className="group flex items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-surface/90 hover:border-primary/45 p-3.5 sm:p-4 shadow-xs hover:shadow-sm transition-all duration-300">
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-3.5 min-w-0 flex-1 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      title={`Email ${contact.email}`}
                      aria-label={`Send email to ${contact.email}`}
                    >
                      <span className="w-10 h-10 shrink-0 rounded-xl border border-border-subtle bg-surface-subtle flex items-center justify-center text-muted group-hover:border-primary/45 group-hover:text-primary transition-colors duration-200">
                        <FaEnvelope aria-hidden="true" className="text-xs" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-body text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
                          Direct Email
                        </span>
                        <span className="block font-body text-sm font-medium text-ink group-hover:text-primary transition-colors truncate">
                          {contact.email}
                        </span>
                      </span>
                    </a>

                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      aria-label={
                        copiedEmail
                          ? 'Email copied to clipboard'
                          : 'Copy email address'
                      }
                      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-body text-xs font-medium transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                        copiedEmail
                          ? 'border-emerald-500/40 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300'
                          : 'border-border-subtle bg-canvas/70 text-muted hover:text-ink hover:border-primary/50 hover:bg-primary/10'
                      }`}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {copiedEmail ? (
                          <motion.span
                            key="copied"
                            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                            transition={{ duration: 0.16 }}
                            className="inline-flex items-center gap-1.5"
                          >
                            <FaCheck aria-hidden="true" className="text-[10px]" />
                            <span>Copied!</span>
                          </motion.span>
                        ) : (
                          <motion.span
                            key="copy"
                            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                            transition={{ duration: 0.16 }}
                            className="inline-flex items-center gap-1.5"
                          >
                            <FaRegCopy aria-hidden="true" className="text-[11px]" />
                            <span>Copy</span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  </div>
                </motion.div>
              )}

              {visibleSocials.length > 0 && (
                <motion.div
                  variants={socialRowVariants}
                  initial={reduceMotion ? false : 'hidden'}
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  className="flex flex-wrap gap-3"
                >
                  {visibleSocials.map((social) => {
                    const IconComp = getSocialIconComponent(social.platform);
                    const hoverClass = getSocialLinkColor(social.colorPreset);
                    const tooltip = social.tooltipText || social.label;
                    return (
                      <motion.a
                        key={social.id || social.platform}
                        variants={socialItemVariants}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={tooltip}
                        title={tooltip}
                        className={`group w-11 h-11 rounded-full border border-border-subtle bg-surface flex items-center justify-center text-base text-muted transition-all duration-200 hover:-translate-y-1 hover:bg-primary/12 hover:text-primary hover:border-primary/55 hover:shadow-xs active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${hoverClass}`}
                      >
                        {createElement(IconComp, {
                          'aria-hidden': true,
                          className:
                            'transition-transform duration-200 group-hover:scale-110',
                        })}
                      </motion.a>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Editorial Form Panel */}
          {showForm && (
            <motion.div
              variants={formCardVariants}
              initial={reduceMotion ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="lg:col-span-7"
            >
              <Card className="p-6 sm:p-8 lg:p-10 transition-all duration-300 hover:border-border-strong">
                <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                  <motion.div
                    variants={reveal(0.24, { y: 12, duration: 0.65 })}
                    initial={reduceMotion ? false : 'hidden'}
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                    className="mb-1"
                  >
                    <h3 className="font-heading text-xl sm:text-2xl font-medium text-ink">
                      {contact?.formHeading || 'Send a Message'}
                    </h3>
                    <p className="font-body text-sm text-muted mt-1">
                      Fill out the form below and I&apos;ll get back to you soon.
                    </p>
                  </motion.div>

                  <input
                    type="checkbox"
                    name="botcheck"
                    className="hidden"
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <motion.div
                    variants={reveal(0.32, { y: 12, duration: 0.65 })}
                    initial={reduceMotion ? false : 'hidden'}
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                  >
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
                  </motion.div>

                  <motion.div
                    variants={reveal(0.4, { y: 12, duration: 0.65 })}
                    initial={reduceMotion ? false : 'hidden'}
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                  >
                    <Input
                      as="textarea"
                      name="message"
                      label="Message"
                      placeholder="Tell me about your project or idea..."
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      disabled={status === 'loading'}
                    />
                  </motion.div>

                  <AnimatePresence mode="wait">
                    {status === 'error' && (
                      <motion.div
                        key="form-error"
                        role="alert"
                        initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300"
                      >
                        {errorMessage}
                      </motion.div>
                    )}

                    {status === 'success' && (
                      <motion.div
                        key="form-success"
                        role="status"
                        initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-300"
                      >
                        Message sent successfully! Thank you for reaching out.
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    variants={reveal(0.48, { y: 12, duration: 0.65 })}
                    initial={reduceMotion ? false : 'hidden'}
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                    className="pt-1"
                  >
                    <Button
                      type="submit"
                      variant="primary"
                      className="group w-full sm:w-auto px-8 py-3.5 text-sm shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-98"
                      disabled={status === 'loading'}
                    >
                      {status === 'loading' ? (
                        <>
                          <FaSpinner
                            aria-hidden="true"
                            className="text-xs animate-spin"
                          />
                          <span>Sending Message...</span>
                        </>
                      ) : (
                        <>
                          <span>{submitLabel}</span>
                          <FaArrowRight
                            aria-hidden="true"
                            className="text-xs opacity-85 transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
