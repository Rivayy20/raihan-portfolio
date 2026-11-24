import { useState } from 'react';
import { FaBuilding } from 'react-icons/fa';

// Logos sit on a fixed white tile (not the theme's --color-white) so transparent
// logos keep their original colors in both themes. Falls back to a neutral icon.
export const OrgLogo = ({ src, alt = '', className = '' }) => {
  const [failed, setFailed] = useState(false);

  return (
    <span
      className={`shrink-0 inline-flex items-center justify-center overflow-hidden bg-[#FFFFFF] border-2 border-black rounded-lg ${className}`}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          width="256"
          height="256"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="w-full h-full object-contain p-0.5"
        />
      ) : (
        <FaBuilding aria-hidden="true" className="w-1/2 h-1/2 text-[#0A0A0A]" />
      )}
    </span>
  );
};
