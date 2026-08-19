import React from 'react';

type SectionDividerProps = {
  className?: string;
};

export const SectionDivider: React.FC<SectionDividerProps> = ({ className = '' }) => (
  <svg
    className={`section-divider h-16 w-full overflow-visible text-cyan-400/50 ${className}`}
    viewBox="0 0 1200 120"
    fill="none"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path
      d="M0 70 C170 20 270 112 420 66 C580 18 650 28 805 72 C970 118 1045 38 1200 62"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);
