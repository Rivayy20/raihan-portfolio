import { FaBriefcase } from 'react-icons/fa';
import { Card } from '../ui/Card';
import { Chevron } from '../ui/Collapse';
import { OrgLogo } from '../ui/OrgLogo';
import { usePortfolioData } from '../../hooks/usePortfolioData';

const pluralize = (count, noun) => `${count} ${noun}${count === 1 ? '' : 's'}`;

export const ExperienceSummary = ({ isExpanded, onToggle, panelId }) => {
  const { data } = usePortfolioData();
  const { about, experiences } = data;
  const supportingText = experiences
    .map((item) => item.shortName || item.organization)
    .join(' · ');

  return (
    <Card className="p-6 sm:p-7">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        className="w-full text-left cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-base text-ink">
              <FaBriefcase />
            </span>
            <div>
              <span className="block font-heading text-lg font-medium text-ink">
                {about?.experienceCardTitle || 'Experience'}
              </span>
              <span className="block font-body text-xs text-muted">
                {about?.experienceCardSubtitle || 'Academic & Industry Experience'}
              </span>
            </div>
          </div>
          <span className="rounded-full bg-surface-subtle border border-border-subtle px-3 py-1 text-xs font-medium text-muted">
            {pluralize(experiences.length, 'Role')}
          </span>
        </div>

        <div className="flex items-center gap-2.5 mt-4" aria-hidden="true">
          {experiences.map(({ id, logo }) => (
            <OrgLogo
              key={`${id}-${logo || 'fallback'}`}
              src={logo}
              className="w-9 h-9"
            />
          ))}
        </div>

        {supportingText && (
          <p className="font-body text-sm text-muted mt-3">{supportingText}</p>
        )}

        <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs font-medium uppercase tracking-[0.14em] text-muted">
          <span>{isExpanded ? 'Collapse Details' : 'Explore Roles'}</span>
          <Chevron isOpen={isExpanded} />
        </div>
      </button>
    </Card>
  );
};
