import { FaBriefcase } from 'react-icons/fa';
import { Card } from '../ui/Card';
import { Chevron } from '../ui/Collapse';
import { OrgLogo } from '../ui/OrgLogo';
import { experiencesData } from '../../data/experiences';

const pluralize = (count, noun) => `${count} ${noun}${count === 1 ? '' : 's'}`;

// Compact overview card. It only toggles the separate ExperiencePanel
// (identified by `panelId`) and never renders the experience list itself.
export const ExperienceSummary = ({ isExpanded, onToggle, panelId }) => {
  const supportingText = experiencesData.map((item) => item.shortName ?? item.organization).join(' · ');

  return (
    <Card
      className={`bg-[#67E8F9] dark:bg-[#00008B] flex flex-col justify-start text-black transition-all duration-300 ${isExpanded ? 'shadow-[6px_6px_0px_0px_var(--color-black)] -translate-y-1' : 'hover:-translate-y-2'}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        className="w-full text-left cursor-pointer rounded-md focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-black"
      >
        <span className="flex justify-between items-start mb-4">
          <span className="w-12 h-12 bg-white brutal-border flex items-center justify-center text-2xl">
            <FaBriefcase />
          </span>
        </span>

        <span className="block text-xl font-black font-heading mb-2">Experience</span>
        <span className="block font-bold text-lg leading-tight">Academic &amp; Industry Experience</span>

        <span className="flex gap-2 mt-3" aria-hidden="true">
          {experiencesData.map(({ id, logo }) => (
            <OrgLogo key={id} src={logo} className="w-9 h-9 sm:w-10 sm:h-10" />
          ))}
        </span>
        <span className="block font-medium mt-2">{supportingText}</span>

        <span className="inline-block mt-4 px-3 py-1 bg-white border-2 border-black rounded-full text-xs font-black uppercase tracking-wide">
          {pluralize(experiencesData.length, 'Experience')}
        </span>

        <span className="mt-4 pt-4 flex items-center justify-between gap-3 font-bold text-sm">
          <span>{isExpanded ? 'Collapse' : 'Click to Explore'}</span>
          <Chevron isOpen={isExpanded} />
        </span>
      </button>
    </Card>
  );
};
