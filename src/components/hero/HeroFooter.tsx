import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

export interface HeroFooterHandles {
  footerElement: HTMLElement | null;
  ruleElement: HTMLDivElement | null;
}

interface HeroFooterProps {
  onSubmitIdea?: () => void;
  onReplay?: () => void;
  isReplaying?: boolean;
  displayMode?: 'nexuscraft' | 'wild';
}

export const HeroFooter = forwardRef<HeroFooterHandles, HeroFooterProps>(({ onSubmitIdea, displayMode = 'nexuscraft' }, ref) => {
  const footerRef = useRef<HTMLElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();

  useImperativeHandle(ref, () => ({
    get footerElement() { return footerRef.current; },
    get ruleElement() { return ruleRef.current; },
  }));

  const handleStartProject = () => {
    if (onSubmitIdea) {
      onSubmitIdea();
      return;
    }
    if (!isAuthenticated) {
      navigate('/login?redirect=/submit-request');
      return;
    }
    if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (user?.role === 'freelancer') {
      navigate('/freelancer/dashboard');
    } else {
      navigate('/submit-request');
    }
  };

  return (
    <footer
      ref={footerRef}
      id="heroFooter"
      className="absolute bottom-0 left-0 right-0 z-20 flex flex-col sm:flex-row items-center sm:items-end justify-between will-change-transform gap-4 sm:gap-0"
      style={{
        padding: 'calc(0.14 * var(--fs)) calc(0.24 * var(--fs))',
        transform: 'translateY(160%)',
        opacity: 0,
      }}
    >
      {/* Left: Paragraph with Drop-Cap matching reference */}
      <div
        className="text-[#3a3a3a] font-normal leading-[1.45] text-left max-w-sm sm:max-w-none select-none"
        style={{
          width: displayMode === 'wild' ? 'calc(1.42 * var(--fs))' : 'calc(2.1 * var(--fs))',
          fontSize: 'calc(0.065 * var(--fs))',
        }}
      >
        <span
          className="float-left font-[750] leading-[0.82] text-[#1d1d1d] select-none"
          style={{
            fontSize: '2.35em',
            marginRight: '0.08em',
            marginTop: '0.04em',
            fontFamily: 'inherit',
          }}
        >
          {displayMode === 'wild' ? 'E' : 'H'}
        </span>
        {displayMode === 'wild'
          ? 'mbark on a wild ride around the world with our travel rental service. Discover breathtaking landscapes and hidden gems on your unforgettable journey.'
          : 'ave an idea worth building? NexusCraft transforms your concept into an intelligent project blueprint, connects you with suitable development specialists and guides your journey towards final delivery.'}
      </div>

      {/* Middle: Expanding 1px Rule */}
      <div
        className="hidden sm:flex flex-1 items-center justify-center"
        style={{
          padding: '0 calc(0.18 * var(--fs))',
          marginBottom: 'calc(0.038 * var(--fs))',
        }}
      >
        <div
          ref={ruleRef}
          className="w-full h-[1px] bg-[#a9a9a6] will-change-transform"
          style={{
            transform: 'scaleX(0)',
            transformOrigin: 'center',
          }}
        />
      </div>

      {/* Right: Black Rounded Pill Button */}
      <div className="flex-shrink-0">
        <button
          onClick={handleStartProject}
          type="button"
          className="inline-flex items-center justify-center gap-2 bg-[#1b1b1b] hover:bg-black text-white font-[600] rounded-full cursor-pointer shadow-[0_6px_18px_rgba(0,0,0,0.12)] hover:scale-[1.03] active:scale-[0.98] transition-all whitespace-nowrap"
          style={{
            padding: 'calc(0.075 * var(--fs)) calc(0.18 * var(--fs))',
            fontSize: 'calc(0.072 * var(--fs))',
            letterSpacing: '-0.01em',
          }}
        >
          <span>{displayMode === 'wild' ? "Let's Get Wild" : 'Start Your Project →'}</span>
        </button>
      </div>
    </footer>
  );
});

HeroFooter.displayName = 'HeroFooter';
export default HeroFooter;
