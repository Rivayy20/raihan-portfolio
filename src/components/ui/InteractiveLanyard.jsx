import { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import fallbackProfileImg from '../../assets/images/profil.png';

const BARCODE_WIDTHS = [
  'w-1',
  'w-2',
  'w-1',
  'w-1',
  'w-2',
  'w-1',
  'w-2',
  'w-1',
  'w-1',
  'w-2',
  'w-1',
  'w-2',
  'w-2',
  'w-1',
  'w-1',
];

export const InteractiveLanyard = ({
  children,
  profileImage,
  headerText = 'ID Badge',
  statusText = 'Access Granted',
  nameText = 'RAIHAN AZKA H.',
  roleText = 'Developer',
}) => {
  const containerRef = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotate = useTransform(x, [-300, 300], [-25, 25]);
  const stringX = useTransform(x, (latestX) => `calc(50% + ${latestX}px)`);
  const stringY = useTransform(y, (latestY) => `calc(50% - 160px + ${latestY}px)`);

  const [isGrabbing, setIsGrabbing] = useState(false);

  const handleDragEnd = () => {
    setIsGrabbing(false);
    animate(x, 0, { type: 'spring', stiffness: 300, damping: 15, mass: 1 });
    animate(y, 0, { type: 'spring', stiffness: 300, damping: 15, mass: 1 });
  };

  return (
    <div
      className="relative w-full h-[320px] md:h-[500px] lg:h-[600px] flex flex-col items-center justify-center overflow-visible"
      ref={containerRef}
    >
      {/* SVG String */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
        <motion.line
          x1="50%"
          y1="-100px"
          x2={stringX}
          y2={stringY}
          className="stroke-[#0A0A0A] dark:stroke-white"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>

      {/* ID Card */}
      <motion.div
        drag
        dragConstraints={{ top: -100, left: -200, right: 200, bottom: 100 }}
        dragElastic={0.3}
        onDragStart={() => setIsGrabbing(true)}
        onDragEnd={handleDragEnd}
        style={{ x, y, rotate }}
        className={`relative z-10 w-[220px] sm:w-[260px] scale-[0.85] md:scale-100 flex flex-col items-center select-none origin-top ${
          isGrabbing ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Lanyard Clip */}
        <div className="w-10 h-6 bg-gray-400 brutal-border border-b-0 rounded-t-xl -mb-1 z-20 flex justify-center items-center shadow-[inset_0_-2px_4px_rgba(0,0,0,0.3)]">
          <div className="w-3 h-3 bg-black rounded-full" />
        </div>

        {/* The Card Body */}
        <div className="w-full bg-white brutal-border p-3 sm:p-4 shadow-[6px_6px_0px_0px_var(--color-black)] flex flex-col gap-3 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-6 bg-black ${i % 2 === 0 ? 'w-1' : 'w-2'}`} />
            ))}
          </div>

          {/* Header */}
          <div className="text-center border-b-4 border-black pb-2 mb-1">
            <h2 className="font-heading font-black text-xl sm:text-2xl uppercase tracking-wider text-black leading-none">
              {headerText}
            </h2>
            {statusText && (
              <p className="font-body font-bold text-[8px] sm:text-[10px] uppercase text-gray-500">
                {statusText}
              </p>
            )}
          </div>

          {/* Portrait Image */}
          <div className="w-full aspect-[4/5] bg-secondary brutal-border overflow-hidden relative">
            <img
              src={profileImage || fallbackProfileImg}
              alt={nameText}
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-cover object-top pointer-events-none"
              draggable="false"
            />
          </div>

          {/* User Details */}
          <div className="flex flex-col gap-1 w-full text-black">
            <div>
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase leading-none">
                Name
              </p>
              <p className="font-heading font-black text-lg sm:text-xl leading-tight">
                {nameText}
              </p>
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase leading-none">
                Role
              </p>
              <div className="bg-primary border-2 border-black px-2 py-1 mt-1 flex justify-center items-center text-center">
                <p className="font-heading font-bold text-xs sm:text-sm leading-tight text-black">
                  {roleText}
                </p>
              </div>
            </div>
          </div>

          {/* Deterministic Bottom Barcode */}
          <div className="w-full h-6 sm:h-8 flex justify-between items-end mt-1 opacity-80">
            {BARCODE_WIDTHS.map((widthClass, i) => (
              <div key={i} className={`bg-black h-full ${widthClass}`} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Floating Badges Overlay */}
      {children && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
          <div className="relative w-[220px] sm:w-[260px] h-[340px] sm:h-[400px]">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};
