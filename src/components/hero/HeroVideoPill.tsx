import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';

export interface HeroVideoPillHandles {
  pillElement: HTMLDivElement | null;
  overlayElement: HTMLDivElement | null;
  iconBreezeElement: HTMLDivElement | null;
  iconSpeakerElement: HTMLButtonElement | null;
  videoElement: HTMLVideoElement | null;
}

export const HeroVideoPill = forwardRef<HeroVideoPillHandles, {}>((_, ref) => {
  const pillRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const iconBreezeRef = useRef<HTMLDivElement>(null);
  const iconSpeakerRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [speakerMuted, setSpeakerMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.defaultMuted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback on first user interaction if autoplay is blocked by browser policy
          const handleFirstInteraction = () => {
            if (videoRef.current) {
              videoRef.current.play().catch(() => {});
            }
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('touchstart', handleFirstInteraction);
            window.removeEventListener('scroll', handleFirstInteraction);
          };
          window.addEventListener('click', handleFirstInteraction, { once: true });
          window.addEventListener('touchstart', handleFirstInteraction, { once: true });
          window.addEventListener('scroll', handleFirstInteraction, { once: true });
        });
      }
    }
  }, []);

  useImperativeHandle(ref, () => ({
    get pillElement() { return pillRef.current; },
    get overlayElement() { return overlayRef.current; },
    get iconBreezeElement() { return iconBreezeRef.current; },
    get iconSpeakerElement() { return iconSpeakerRef.current; },
    get videoElement() { return videoRef.current; },
  }));

  const handleSpeakerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setSpeakerMuted(video.muted);
    } else {
      setSpeakerMuted(prev => !prev);
    }
  };

  return (
    <div
      ref={pillRef}
      id="nexusPill"
      className="relative overflow-hidden flex-shrink-0 bg-[#d8d3cf] rounded-full will-change-transform shadow-[0_12px_40px_rgba(0,0,0,0.14)] select-none cursor-pointer"
      style={{
        height: 'var(--pill-h, calc(1.81 * var(--fs)))',
        width: 'calc(0.012 * var(--fs))', // Starts as hairline
        clipPath: 'inset(50% 0)', // Vertically clipped initially
      }}
      onClick={() => {
        if (videoRef.current && videoRef.current.paused) {
          videoRef.current.play().catch(() => {});
        }
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          EXACT FLOATING ISLAND WATERFALL VIDEO SCENE FROM REFERENCE
      ───────────────────────────────────────────────────────────── */}
      <video
        ref={videoRef}
        id="nexusPillVideo"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/images/wild-poster.jpg"
        className="absolute top-0 left-1/2 -translate-x-1/2 h-full pointer-events-none block z-0"
        style={{
          minWidth: 'calc(4.2 * var(--fs))',
          width: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
          opacity: 1,
        }}
      >
        <source src="/videos/wild-island.mp4" type="video/mp4" />
        <source src="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/175fbbcd-e50a-480c-bab2-ca16d4678322.mp4" type="video/mp4" />
      </video>

      {/* Hairline Accent Overlay (Active only during initial 0.14-0.30s slit expansion) */}
      <div
        ref={overlayRef}
        id="nexusPillOverlay"
        className="absolute inset-0 bg-[#b9b9b9] pointer-events-none z-[1]"
        style={{ opacity: 1, willChange: 'opacity' }}
      />

      {/* Left Breeze Line Icon */}
      <div
        ref={iconBreezeRef}
        className="absolute top-1/2 -translate-y-1/2 text-white pointer-events-none z-[2] flex items-center justify-center drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
        style={{
          left: 'calc(0.18 * var(--fs))',
          width: 'calc(0.12 * var(--fs))',
          height: 'calc(0.12 * var(--fs))',
          opacity: 0,
          willChange: 'opacity',
        }}
        title="Breeze"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full stroke-current fill-none" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 8h11a3 3 0 1 0-3-3" />
          <path d="M2 13h16a3 3 0 1 1-3 3" />
          <path d="M5 18h7a2.5 2.5 0 1 0-2.5-2.5" />
        </svg>
      </div>

      {/* Right Speaker Audio Toggle Icon */}
      <button
        ref={iconSpeakerRef}
        onClick={handleSpeakerClick}
        type="button"
        aria-label="Toggle audio waves"
        className="absolute top-1/2 -translate-y-1/2 text-white cursor-pointer z-[2] flex items-center justify-center p-0 bg-transparent border-0 outline-none hover:scale-110 active:scale-95 transition-transform drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
        style={{
          right: 'calc(0.18 * var(--fs))',
          width: 'calc(0.12 * var(--fs))',
          height: 'calc(0.12 * var(--fs))',
          opacity: 0,
          willChange: 'opacity',
        }}
      >
        <svg viewBox="0 0 24 24" className="w-full h-full stroke-current fill-none" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" opacity="0.3" />
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path
            d="M15.54 8.46a5 5 0 0 1 0 7.07"
            className="transition-opacity duration-200"
            style={{ opacity: speakerMuted ? 0 : 1 }}
          />
          <path
            d="M19.07 4.93a10 10 0 0 1 0 14.14"
            className="transition-opacity duration-200"
            style={{ opacity: speakerMuted ? 0 : 1 }}
          />
        </svg>
      </button>
    </div>
  );
});

HeroVideoPill.displayName = 'HeroVideoPill';
export default HeroVideoPill;
