import { useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';
import { ExperienceSummary } from './ExperienceSummary';
import { ExperiencePanel } from './ExperiencePanel';
import { CertificationsSection } from './CertificationsSection';
import { FaGraduationCap, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { containerVariants, itemVariants } from '../../utils/motionVariants';

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renderHighlightedParagraph(text, highlights = []) {
  const cleanHighlights = (highlights || [])
    .map((h) => String(h || '').trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if (!cleanHighlights.length) return text;

  const pattern = new RegExp(`(${cleanHighlights.map(escapeRegExp).join('|')})`, 'gi');
  const parts = String(text || '').split(pattern);

  return parts.map((part, idx) => {
    const matched = cleanHighlights.some(
      (phrase) => phrase.toLowerCase() === part.toLowerCase()
    );
    if (!matched) return part;
    return (
      <mark key={idx} className="bg-accent text-black px-1 font-bold">
        {part}
      </mark>
    );
  });
}

const EducationCard = ({ about, education, isExpanded, onToggle }) => {
  const currentItems = education.filter((item) => item.educationLevel === 'current');
  const previousItems = education.filter((item) => item.educationLevel !== 'current');

  const primaryList = currentItems.length > 0 ? currentItems : education.slice(0, 1);
  const secondaryList =
    currentItems.length > 0 ? previousItems : education.slice(1);
  const hasExpandable =
    secondaryList.length > 0 || primaryList.some((item) => Boolean(item.description));

  const primaryFirst = primaryList[0];

  return (
    <Card
      className={`bg-[#FDE047] dark:bg-[#B8860B] flex flex-col justify-start transition-all duration-300 ${
        hasExpandable ? 'cursor-pointer' : ''
      } ${
        isExpanded
          ? 'shadow-[6px_6px_0px_0px_var(--color-black)] -translate-y-1'
          : 'hover:-translate-y-2'
      }`}
      onClick={hasExpandable ? onToggle : undefined}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-white brutal-border flex items-center justify-center text-2xl text-black overflow-hidden">
          {primaryFirst?.logoUrl ? (
            <img
              src={primaryFirst.logoUrl}
              alt={primaryFirst.institution}
              loading="lazy"
              decoding="async"
              className="w-9 h-9 object-contain"
            />
          ) : (
            <FaGraduationCap />
          )}
        </div>
      </div>

      <h3 className="text-xl font-black mb-2 text-black">
        {about?.educationCardTitle || 'Education'}
      </h3>

      {primaryList.map((edu, idx) => (
        <div key={edu.id || idx} className={idx > 0 ? 'mt-4 pt-3 border-t border-black/15' : ''}>
          {(edu.degree || edu.major) && (
            <p className="font-bold text-lg leading-tight text-black">
              {edu.degree || edu.major}
            </p>
          )}
          <p className="font-medium mt-2 text-black">{edu.institution}</p>
          {edu.period && (
            <p className="text-sm font-bold opacity-70 mt-1 text-black">{edu.period}</p>
          )}
        </div>
      ))}

      {hasExpandable && (
        <>
          <div className="mt-4 pt-4 flex items-center justify-between font-bold text-sm opacity-80 hover:opacity-100 transition-opacity text-black">
            <span>{isExpanded ? 'Collapse' : 'Click to Expand'}</span>
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t-2 border-black/20 mt-2">
                  {primaryList.some((e) => Boolean(e.description)) && (
                    <div className="mb-4 space-y-2">
                      {primaryList.map(
                        (e) =>
                          e.description && (
                            <p key={e.id} className="text-sm font-medium text-black">
                              {e.description}
                            </p>
                          )
                      )}
                    </div>
                  )}

                  {secondaryList.length > 0 && (
                    <>
                      <h4 className="font-black text-lg mb-4 text-black">
                        {about?.previousEduHeading || 'Previous Education'}
                      </h4>

                      {secondaryList.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className={idx < secondaryList.length - 1 ? 'mb-4' : ''}
                        >
                          <div className="flex items-start gap-2.5">
                            {item.logoUrl && (
                              <img
                                src={item.logoUrl}
                                alt={item.institution}
                                loading="lazy"
                                decoding="async"
                                className="w-7 h-7 object-contain bg-white border border-black rounded p-0.5 shrink-0 mt-0.5"
                              />
                            )}
                            <div>
                              <p className="font-bold text-base text-black">
                                {item.institution}
                              </p>
                              {(item.degree || item.major) && (
                                <p className="text-sm font-medium text-black">
                                  {item.degree
                                    ? `${item.degree}${item.major ? ` — ${item.major}` : ''}`
                                    : `Major: ${item.major}`}
                                </p>
                              )}
                              {item.period && (
                                <p className="text-sm font-bold opacity-70 mt-1 text-black">
                                  {item.period}
                                </p>
                              )}
                              {item.description && (
                                <p className="text-sm text-black/80 mt-1">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </Card>
  );
};

export const AboutSection = ({ sectionConfig }) => {
  const { data } = usePortfolioData();
  const { about, education, experiences, certifications } = data;
  const [expandedCard, setExpandedCard] = useState(null);
  const experiencePanelId = useId();

  const handleToggle = (cardId) => {
    setExpandedCard((prev) => (prev === cardId ? null : cardId));
  };

  const showNarrative =
    about?.showNarrative !== false && (about?.narrativeParagraphs || []).length > 0;
  const showEdu = about?.showEducationCard !== false && education.length > 0;
  const showExp = about?.showExperienceCard !== false && experiences.length > 0;
  const showCerts = about?.showCertifications !== false && certifications.length > 0;

  return (
    <Section
      id="about"
      title={sectionConfig?.title || 'About Me'}
      subtitle={
        sectionConfig?.subtitle ||
        'Combining logic with creativity to build memorable digital solutions.'
      }
      alignment={sectionConfig?.contentAlignment || 'left'}
    >
      <div className="flex flex-col">
        {(showNarrative || showEdu || showExp) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-start">
            {/* Personal Narrative */}
            {showNarrative && (
              <motion.div
                className={
                  showEdu || showExp ? 'md:col-span-2 lg:col-span-5' : 'md:col-span-2 lg:col-span-12'
                }
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={itemVariants}
              >
                <Card className="bg-base">
                  <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 bg-accent brutal-border flex items-center justify-center rounded-full text-lg">
                      !
                    </span>
                    {about?.narrativeTitle || 'The Narrative'}
                  </h3>
                  <div className="space-y-4 text-lg font-medium text-left text-gray-800 dark:text-gray-300 transition-colors duration-300">
                    {(about?.narrativeParagraphs || []).map((paragraph, idx) => (
                      <p key={idx}>
                        {renderHighlightedParagraph(
                          paragraph,
                          about?.narrativeHighlights
                        )}
                      </p>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Education & Experience summary */}
            {(showEdu || showExp) && (
              <motion.div
                className={`${
                  showNarrative ? 'md:col-span-2 lg:col-span-7' : 'md:col-span-2 lg:col-span-12'
                } grid grid-cols-1 ${showEdu && showExp ? 'md:grid-cols-2 lg:grid-cols-1' : ''} gap-8 items-start`}
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
              >
                {showEdu && (
                  <motion.div variants={itemVariants}>
                    <EducationCard
                      about={about}
                      education={education}
                      isExpanded={expandedCard === 'edu'}
                      onToggle={() => handleToggle('edu')}
                    />
                  </motion.div>
                )}

                {showExp && (
                  <motion.div variants={itemVariants}>
                    <ExperienceSummary
                      isExpanded={expandedCard === 'exp'}
                      onToggle={() => handleToggle('exp')}
                      panelId={experiencePanelId}
                    />
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* Full-width Experience Details */}
        {showExp && (
          <ExperiencePanel id={experiencePanelId} isOpen={expandedCard === 'exp'} />
        )}

        {showCerts && (
          <div className="pt-12">
            <CertificationsSection
              expandedId={expandedCard}
              onToggle={handleToggle}
            />
          </div>
        )}
      </div>
    </Section>
  );
};
