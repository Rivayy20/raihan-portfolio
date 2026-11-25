import { useState } from 'react';
import { FaBuilding } from 'react-icons/fa';

// Logos sit on a fixed clean white tile so transparent org logos preserve brand
// fidelity across both Light and Dark themes.
export const OrgLogo = ({ src, alt = '', className = '' }) => {
  const [failed, setFailed] = useState(false);

  return (
    <span
      className={`shrink-0 inline-flex items-center justify-center overflow-hidden bg-[#FFFFFF] border border-border-subtle rounded-xl shadow-2xs ${className}`}
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
          className="w-full h-full object-contain p-1"
        />
      ) : (
        <FaBuilding aria-hidden="true" className="w-1/2 h-1/2 text-[#171719]/75" />
      )}
    </span>
  );
};
