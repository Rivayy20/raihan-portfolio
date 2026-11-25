import { motion, useReducedMotion } from 'framer-motion';
import { EDITORIAL_EASE } from '../../utils/motionVariants';

export const Section = ({
  id,
  eyebrow,
  title,
  subtitle,
  alignment = 'left',
  children,
  className = '',
}) => {
  const isCentered = alignment === 'center';
  const reduceMotion = useReducedMotion();

  return (
    <section
      id={id}
      className={`py-20 sm:py-28 md:py-32 scroll-mt-24 ${className}`}
    >
      <div className="flex flex-col gap-12 sm:gap-14">
        {(eyebrow || title || subtitle) && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: EDITORIAL_EASE }}
            className={`flex flex-col gap-4 border-t border-border-subtle pt-8 ${
              isCentered
                ? 'mx-auto max-w-3xl items-center text-center'
                : 'max-w-3xl'
            }`}
          >
            {eyebrow && (
              <span className="inline-flex items-center gap-2 font-body text-xs font-medium uppercase tracking-[0.2em] text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                {eyebrow}
              </span>
            )}
            {title && (
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-medium tracking-[-0.03em] leading-[1.08] text-ink">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="font-body text-base sm:text-lg text-muted leading-relaxed">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        {children}
      </div>
    </section>
  );
};
