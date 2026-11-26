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
import { SpiderIcon, SpiderWebCorner } from '../ui/SpiderManElements';
import { getSocialLinkColor, isSpiderManPreset } from '../../constants/colorPresets';
import { getSocialIconComponent } from '../../utils/socialIcons';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
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
  const { resolvedTheme } = useTheme();
  const { t } = useLanguage();
  const { contact, socialLinks, hero, settings } = data;
  const reduceMotion = useReducedMotion();
  const isSpiderMan =
    resolvedTheme?.isSpiderMan || isSpiderManPreset(settings?.colorPreset);
  const contactInteractionEnabled =
    resolvedTheme?.config?.effects?.contactInteraction !== false;
  const webBackgroundEnabled =
    resolvedTheme?.config?.effects?.webBackground !== false;
  const viewportOnce =
    resolvedTheme?.config?.animation?.replayOnScroll === false;

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [webShootBurstKey, setWebShootBurstKey] = useState(0);

  const copyTimerRef = useRef(null);
  const statusTimerRef = useRef(null);
  const lastSubmittedAtRef = useRef(0);

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

    const botcheck = e.target.elements.botcheck;
    if (botcheck && botcheck.checked) {
      setFormData({ name: '', email: '', message: '' });
      setErrorMessage('');
      setStatus('success');
      return;
    }

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedMessage = formData.message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setErrorMessage(t('contact.errorRequired', 'Please fill all required fields.'));
      setStatus('error');
      return;
    }

    if (trimmedName.length > 120) {
      setErrorMessage(
        t('contact.errorNameLength', 'Name must be 120 characters or fewer.')
      );
      setStatus('error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (trimmedEmail.length > 254 || !emailRegex.test(trimmedEmail)) {
      setErrorMessage(
        t('contact.errorEmail', 'Please enter a valid email address.')
      );
      setStatus('error');
      return;
    }

    if (trimmedMessage.length > 3000) {
      setErrorMessage(
        t(
          'contact.errorMessageLength',
          'Message must be 3000 characters or fewer.'
        )
      );
      setStatus('error');
      return;
    }

    if (
      lastSubmittedAtRef.current > 0 &&
      Date.now() - lastSubmittedAtRef.current < 15000
    ) {
      setErrorMessage(
        t(
          'contact.errorCooldown',
          'Please wait a few seconds before sending another message.'
        )
      );
      setStatus('error');
      return;
    }

    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY?.trim();
    if (!accessKey) {
      setErrorMessage(
        t(
          'contact.errorUnavailable',
          'Contact form is temporarily unavailable. Please reach out via direct email.'
        )
      );
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');
    if (contactInteractionEnabled && !reduceMotion) {
      setWebShootBurstKey((k) => k + 1);
    }

    try {
      const formPayload = new FormData();
      formPayload.append('access_key', accessKey);
      formPayload.append('name', trimmedName);
      formPayload.append('email', trimmedEmail);
      formPayload.append('message', trimmedMessage);
      formPayload.append('subject', 'Portfolio Contact Form Submission');

      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formPayload,
      });

      const resData = await res.json();

      if (resData.success) {
        lastSubmittedAtRef.current = Date.now();
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        if (statusTimerRef.current) window.clearTimeout(statusTimerRef.current);
        statusTimerRef.current = window.setTimeout(() => setStatus(''), 5000);
      } else {
        setStatus('error');
        setErrorMessage(
          resData.message ||
            t(
              'contact.errorGeneric',
              'Failed to send message. Please try again later.'
            )
        );
      }
    } catch {
      setStatus('error');
      setErrorMessage(
        t(
          'contact.errorGeneric',
          'Failed to send message. Please try again later.'
        )
      );
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
      {isSpiderMan && webBackgroundEnabled && (
        <SpiderWebCorner
          position="bottom-right"
          style={{ color: 'var(--color-web-line)' }}
          className="pointer-events-none absolute bottom-0 right-0 w-44 sm:w-56 h-44 sm:h-56 -z-20"
        />
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-16 -left-16 w-80 sm:w-110 h-80 sm:h-110 rounded-full opacity-25 dark:opacity-20 blur-3xl -z-10"
        style={{
          background:
            'radial-gradient(circle, var(--color-web-glow), var(--color-electric-glow) 54%, transparent 80%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 right-0 w-80 sm:w-110 h-80 sm:h-110 rounded-full opacity-20 dark:opacity-18 blur-3xl -z-10"
        style={{
          background:
            'radial-gradient(circle, var(--color-electric-glow), var(--color-web-glow) 52%, transparent 80%)',
        }}
      />

      <div className="flex flex-col gap-12 sm:gap-14">
        {/* Hairline Section Label */}
        <motion.div
          variants={reveal(0, { y: 12, duration: 0.65 })}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: viewportOnce, amount: 0.2 }}
          className="border-t border-border-subtle pt-8 max-w-3xl"
        >
          <span className="inline-flex items-center gap-2 font-body text-xs font-medium uppercase tracking-[0.2em] text-muted">
            {isSpiderMan ? (
              <SpiderIcon className="w-3.5 h-3.5 text-primary shrink-0" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            )}
            {t('contact.eyebrow', '04 / Contact')}
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
                  viewport={{ once: viewportOnce, amount: 0.2 }}
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
                viewport={{ once: viewportOnce, amount: 0.2 }}
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
                viewport={{ once: viewportOnce, amount: 0.2 }}
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
                  viewport={{ once: viewportOnce, amount: 0.2 }}
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
                  viewport={{ once: viewportOnce, amount: 0.2 }}
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
                          {t('contact.directEmail', 'Direct Email')}
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
                            <span>{t('contact.copied', 'Copied!')}</span>
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
                            <span>{t('contact.copy', 'Copy')}</span>
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
                  viewport={{ once: viewportOnce, amount: 0.2 }}
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
              viewport={{ once: viewportOnce, amount: 0.15 }}
              className="lg:col-span-7"
            >
              <Card className="p-6 sm:p-8 lg:p-10 transition-all duration-300 hover:border-border-strong">
                <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                  <motion.div
                    variants={reveal(0.24, { y: 12, duration: 0.65 })}
                    initial={reduceMotion ? false : 'hidden'}
                    whileInView="visible"
                    viewport={{ once: viewportOnce, amount: 0.15 }}
                    className="mb-1"
                  >
                    <h3 className="font-heading text-xl sm:text-2xl font-medium text-ink">
                      {contact?.formHeading || 'Send a Message'}
                    </h3>
                    <p className="font-body text-sm text-muted mt-1">
                      {t(
                        'contact.formSubheading',
                        "Fill out the form below and I'll get back to you soon."
                      )}
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
                    viewport={{ once: viewportOnce, amount: 0.15 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                  >
                    <Input
                      name="name"
                      label={t('contact.nameLabel', 'Your Name')}
                      placeholder={t('contact.namePlaceholder', 'John Doe')}
                      value={formData.name}
                      onChange={handleChange}
                      maxLength={120}
                      required
                      disabled={status === 'loading'}
                    />

                    <Input
                      name="email"
                      label={t('contact.emailLabel', 'Email Address')}
                      type="email"
                      placeholder={t('contact.emailPlaceholder', 'john@example.com')}
                      value={formData.email}
                      onChange={handleChange}
                      maxLength={254}
                      required
                      disabled={status === 'loading'}
                    />
                  </motion.div>

                  <motion.div
                    variants={reveal(0.4, { y: 12, duration: 0.65 })}
                    initial={reduceMotion ? false : 'hidden'}
                    whileInView="visible"
                    viewport={{ once: viewportOnce, amount: 0.15 }}
                  >
                    <Input
                      as="textarea"
                      name="message"
                      label={t('contact.messageLabel', 'Message')}
                      placeholder={t(
                        'contact.messagePlaceholder',
                        'Tell me about your project or idea...'
                      )}
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      maxLength={3000}
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
                        animate={
                          reduceMotion || !contactInteractionEnabled
                            ? { opacity: 1, y: 0 }
                            : { opacity: 1, y: 0, x: [0, -5, 5, -3, 0] }
                        }
                        exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                        transition={{ duration: 0.28 }}
                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300"
                      >
                        {errorMessage}
                      </motion.div>
                    )}

                    {status === 'success' && (
                      <motion.div
                        key="form-success"
                        role="status"
                        initial={
                          reduceMotion
                            ? false
                            : { opacity: 0, scale: 0.96, y: -6 }
                        }
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                        transition={{ duration: 0.3, ease: EDITORIAL_EASE }}
                        style={
                          contactInteractionEnabled
                            ? { boxShadow: '0 8px 26px -10px var(--color-web-glow)' }
                            : undefined
                        }
                        className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-2.5"
                      >
                        {contactInteractionEnabled && (
                          <SpiderIcon className="w-4 h-4 text-primary shrink-0" />
                        )}
                        <span>
                          {t(
                            'contact.successMsg',
                            'Message sent successfully! Thank you for reaching out.'
                          )}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    variants={reveal(0.48, { y: 12, duration: 0.65 })}
                    initial={reduceMotion ? false : 'hidden'}
                    whileInView="visible"
                    viewport={{ once: viewportOnce, amount: 0.15 }}
                    className="pt-1 flex items-center gap-3"
                  >
                    <div className="relative inline-flex w-full sm:w-auto">
                      <Button
                        type="submit"
                        variant="primary"
                        style={
                          contactInteractionEnabled
                            ? { boxShadow: '0 10px 24px -10px var(--color-web-glow)' }
                            : undefined
                        }
                        className="group w-full sm:w-auto px-8 py-3.5 text-sm shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-98"
                        disabled={status === 'loading'}
                      >
                        {status === 'loading' ? (
                          <>
                            <FaSpinner
                              aria-hidden="true"
                              className="text-xs animate-spin"
                            />
                            <span>{t('contact.sending', 'Sending Message...')}</span>
                          </>
                        ) : (
                          <>
                            {contactInteractionEnabled && isSpiderMan && (
                              <SpiderIcon className="w-3.5 h-3.5 opacity-90 shrink-0" />
                            )}
                            <span>{submitLabel}</span>
                            <FaArrowRight
                              aria-hidden="true"
                              className="text-xs opacity-85 transition-transform duration-300 group-hover:translate-x-1"
                            />
                          </>
                        )}
                      </Button>

                      {/* Theme-aware SVG Web-Shooting Streak on Submit */}
                      <AnimatePresence>
                        {contactInteractionEnabled &&
                          !reduceMotion &&
                          webShootBurstKey > 0 &&
                          status === 'loading' && (
                            <motion.svg
                              key={webShootBurstKey}
                              viewBox="0 0 88 28"
                              fill="none"
                              aria-hidden="true"
                              initial={{ opacity: 0.95, scaleX: 0.15 }}
                              animate={{ opacity: 0, scaleX: 1.2 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.45, ease: 'easeOut' }}
                              style={{ transformOrigin: '0% 50%' }}
                              className="pointer-events-none hidden sm:block absolute left-full top-1/2 -translate-y-1/2 ml-2 w-20 h-7"
                            >
                              <path
                                d="M2 14L78 14M2 14L64 5M2 14L64 23"
                                stroke="var(--color-spider-red)"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                              />
                              <circle cx="80" cy="14" r="2.2" fill="var(--color-electric-blue)" />
                            </motion.svg>
                          )}
                      </AnimatePresence>
                    </div>
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
