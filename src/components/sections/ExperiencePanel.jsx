import { useEffect, useId, useRef, useState } from 'react';
import { FaBriefcase } from 'react-icons/fa';
import { Card } from '../ui/Card';
import { Chevron, Collapse } from '../ui/Collapse';
import { OrgLogo } from '../ui/OrgLogo';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { scrollToElement } from '../../utils/scrollTo';

const FOCUS_RING =
  'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-black';

const TYPE_LABELS = {
  internship: { label: 'Internship', color: 'bg-primary' },
  academic: { label: 'Academic', color: 'bg-white' },
  organization: { label: 'Organization', color: 'bg-white' },
  full_time: { label: 'Full-Time', color: 'bg-primary' },
  part_time: { label: 'Part-Time', color: 'bg-primary' },
  freelance: { label: 'Freelance', color: 'bg-accent' },
};

const getBadge = ({ status, isCurrent, type }) => {
  if (status === 'current' || isCurrent) {
    return { label: 'Current', color: 'bg-accent' };
  }
  if (type === 'internship') return TYPE_LABELS.internship;
  return TYPE_LABELS[type] || null;
};

const Facts = ({ facts }) => (
  <dl className="flex flex-col gap-2">
    {facts.map(({ label, value }, idx) => (
      <div key={`${label}-${idx}`}>
        <dt className="font-bold text-xs uppercase tracking-wide opacity-70">{label}</dt>
        <dd className="font-bold text-sm">{value}</dd>
      </div>
    ))}
  </dl>
);

const BulletList = ({ items }) => (
  <ul className="list-disc pl-5 font-medium text-sm space-y-1.5">
    {items.map((item, idx) => {
      const { label, text } = typeof item === 'string' ? { text: item } : item;
      return (
        <li key={`${label || text}-${idx}`}>
          {label && <strong className="font-black">{label}: </strong>}
          {text}
        </li>
      );
    })}
  </ul>
);

const Chips = ({ items }) => (
  <ul className="flex flex-wrap gap-2">
    {items.map((item, idx) => (
      <li
        key={`${item}-${idx}`}
        className="px-2 py-1 border-2 border-black rounded-md text-xs font-bold bg-white"
      >
        {item}
      </li>
    ))}
  </ul>
);

const DetailSection = ({ title, text, facts, items, chips, note }) => (
  <section className="flex flex-col gap-2">
    <h5 className="flex items-center gap-2 font-black text-sm uppercase tracking-wide">
      <span
        aria-hidden="true"
        className="w-2.5 h-2.5 shrink-0 bg-accent border-2 border-black"
      />
      {title}
    </h5>
    {text && <p className="font-medium text-sm">{text}</p>}
    {facts?.length > 0 && <Facts facts={facts} />}
    {items?.length > 0 && <BulletList items={items} />}
    {chips?.length > 0 && <Chips items={chips} />}
    {note && <p className="text-xs font-bold italic opacity-70">{note}</p>}
  </section>
);

const ExperienceDetails = ({ experience }) => {
  const hasCustomSections = (experience.sections || []).length > 0;

  return (
    <div className="pt-4 mt-4 border-t-2 border-black/20 flex flex-col gap-5">
      {hasCustomSections ? (
        experience.sections.map((section, idx) => (
          <DetailSection key={section.id || `${section.title}-${idx}`} {...section} />
        ))
      ) : (
        <>
          {(experience.detailedDescription || experience.summary) && (
            <DetailSection
              title="Overview"
              text={experience.detailedDescription || experience.summary}
            />
          )}
          {experience.responsibilities?.length > 0 && (
            <DetailSection
              title="Responsibilities"
              items={experience.responsibilities}
            />
          )}
          {experience.relevantSkills?.length > 0 && (
            <DetailSection title="Relevant Skills" chips={experience.relevantSkills} />
          )}
        </>
      )}
    </div>
  );
};

const ExperienceItem = ({ experience, isOpen, onToggle }) => {
  const detailsId = useId();
  const { position, organization, institution, division, duration, period, logo, logoAlt } =
    experience;
  const badge = getBadge(experience);
  const timeframe = duration || period;

  return (
    <li className="bg-white text-black border-2 border-black rounded-lg p-4 shadow-[3px_3px_0px_0px_var(--color-black)]">
      <div className="flex items-start gap-3">
        <OrgLogo
          key={`${experience.id}-${logo || 'fallback'}`}
          src={logo}
          alt={logoAlt}
          className="w-11 h-11 sm:w-14 sm:h-14"
        />
        <div className="min-w-0 flex-1">
          {badge && (
            <span
              className={`inline-block px-2 py-0.5 mb-2 text-xs font-black uppercase tracking-wide text-[#0A0A0A] border-2 border-black rounded-full ${badge.color}`}
            >
              {badge.label}
            </span>
          )}
          <h4 className="font-black text-lg leading-tight">{position}</h4>
          <p className="font-medium text-sm mt-1">{organization}</p>
          {institution && (
            <p className="font-medium text-sm">
              {institution}
              {division ? ` · ${division}` : ''}
            </p>
          )}
          {timeframe && <p className="font-bold text-sm opacity-70 mt-1">{timeframe}</p>}
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={detailsId}
        className={`mt-4 w-full sm:w-auto min-h-11 inline-flex items-center justify-center gap-2 px-4 py-2 bg-black text-white font-bold text-sm border-2 border-black rounded-md cursor-pointer hover:bg-white hover:text-black transition-colors ${FOCUS_RING}`}
      >
        <span>{isOpen ? 'Hide Details' : 'View Details'}</span>
        <Chevron isOpen={isOpen} />
      </button>

      <Collapse show={isOpen} id={detailsId}>
        <ExperienceDetails experience={experience} />
      </Collapse>
    </li>
  );
};

const ExperienceList = ({ experiences }) => {
  const [openId, setOpenId] = useState(null);
  const panelRef = useRef(null);

  useEffect(() => {
    scrollToElement(panelRef.current);
  }, []);

  return (
    <Card
      ref={panelRef}
      className="experience-details-panel bg-gray-100 dark:bg-[#0A0A0A] p-4! sm:p-6!"
    >
      <h3 className="flex items-center gap-3 text-2xl font-black mb-6">
        <span className="w-10 h-10 bg-primary brutal-border flex items-center justify-center text-lg text-[#0A0A0A]">
          <FaBriefcase aria-hidden="true" />
        </span>
        Experience Details
      </h3>
      <ul className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {experiences.map((experience) => (
          <ExperienceItem
            key={experience.id}
            experience={experience}
            isOpen={openId === experience.id}
            onToggle={() =>
              setOpenId((prev) => (prev === experience.id ? null : experience.id))
            }
          />
        ))}
      </ul>
    </Card>
  );
};

export const ExperiencePanel = ({ id, isOpen }) => {
  const { data } = usePortfolioData();
  const { experiences } = data;

  return (
    <Collapse show={isOpen} id={id}>
      <div className="pt-8 pr-2 pb-2">
        <ExperienceList experiences={experiences} />
      </div>
    </Collapse>
  );
};
