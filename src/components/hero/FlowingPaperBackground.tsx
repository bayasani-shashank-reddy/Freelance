import { forwardRef } from 'react';

export interface FlowingPaperBackgroundProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const FlowingPaperBackground = forwardRef<HTMLDivElement, FlowingPaperBackgroundProps>(({ id = 'bgPaper', className = '', style }, ref) => {
  return (
    <div
      ref={ref}
      id={id}
      className={`absolute inset-0 w-full h-full pointer-events-none z-[1] bg-[#f2f2f1] ${className}`}
      style={{ opacity: 0, willChange: 'opacity', ...style }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 960"
        fill="none"
        preserveAspectRatio="none"
        className="w-full h-full block"
      >
        {/* 15 flowing white strokes sweeping up and to the right as soft S-curves (stroke 1.2-3.9px, opacity 0.55-0.85) */}
        <path d="M-60,980 C260,860 620,740 1500,420" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" opacity="0.75" />
        <path d="M-40,910 C320,810 740,680 1520,360" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.62" />
        <path d="M-100,850 C290,730 680,610 1500,280" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" opacity="0.80" />
        <path d="M-20,780 C360,670 780,540 1520,210" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.58" />
        <path d="M-80,720 C340,600 810,480 1500,160" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.70" />
        <path d="M-50,650 C380,530 840,410 1520,110" stroke="#ffffff" strokeWidth="3.8" strokeLinecap="round" opacity="0.82" />
        <path d="M-120,590 C320,470 820,350 1500,60" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.64" />
        <path d="M-40,520 C390,410 870,290 1520,10" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" opacity="0.74" />
        <path d="M-90,460 C370,340 890,230 1510,-40" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" opacity="0.56" />
        <path d="M-60,390 C420,280 920,180 1530,-90" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" opacity="0.78" />
        <path d="M-110,330 C400,220 950,120 1500,-140" stroke="#ffffff" strokeWidth="1.9" strokeLinecap="round" opacity="0.68" />
        <path d="M-30,270 C440,160 980,60 1520,-190" stroke="#ffffff" strokeWidth="2.9" strokeLinecap="round" opacity="0.84" />
        <path d="M-70,200 C460,100 1020,10 1540,-240" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.60" />
        <path d="M-100,140 C480,40 1060,-40 1500,-290" stroke="#ffffff" strokeWidth="3.6" strokeLinecap="round" opacity="0.72" />
        <path d="M-50,80 C510,-20 1100,-90 1530,-340" stroke="#ffffff" strokeWidth="2.1" strokeLinecap="round" opacity="0.66" />
      </svg>
    </div>
  );
});

FlowingPaperBackground.displayName = 'FlowingPaperBackground';
export default FlowingPaperBackground;
