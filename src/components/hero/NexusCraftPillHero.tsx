import React, { useEffect, useRef, useState, useCallback } from 'react';
import FlowingPaperBackground from './FlowingPaperBackground';
import HeroVideoPill, { type HeroVideoPillHandles } from './HeroVideoPill';
import HeroNavigation from './HeroNavigation';
import HeroFooter, { type HeroFooterHandles } from './HeroFooter';

export const NexusCraftPillHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRowRef = useRef<HTMLDivElement>(null);
  const bgPaperRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const pillHandlesRef = useRef<HeroVideoPillHandles>(null);
  const footerHandlesRef = useRef<HeroFooterHandles>(null);

  const [displayMode, setDisplayMode] = useState<'nexuscraft' | 'wild'>('nexuscraft');
  const [isPhone, setIsPhone] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 720 : false
  );
  const [isCollapsing, setIsCollapsing] = useState(false);
  const activeAnimationsRef = useRef<Animation[]>([]);

  // Calculate unit values ensuring text and pill fit with zero clipping on all screens
  const getUnitValues = useCallback(() => {
    const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1440;
    const phone = vw <= 720;

    if (phone) {
      const fs = displayMode === 'wild'
        ? Math.min(vw * 0.32, vh * 0.16)
        : Math.min(vw * 0.16, vh * 0.09);
      const phonePillW = vw - 40;
      const phonePillH = phonePillW / 1.85;
      return {
        fs,
        desktopPillW: phonePillW,
        desktopHairlineW: 2,
        desktopSlitW: 16,
        desktopCircleW: phonePillH,
        phonePillW,
        phonePillH,
      };
    }

    // Desktop sizing
    if (displayMode === 'wild') {
      // WI (1.5em) + Pill (3.62em) + LD (1.5em) = 6.62em
      const maxFsByWidth = (vw * 0.88) / 6.62;
      const maxFsByHeight = vh * 0.196;
      const fs = Math.max(48, Math.min(maxFsByWidth, maxFsByHeight));
      return {
        fs,
        desktopPillW: fs * 3.62,
        desktopHairlineW: Math.max(2, fs * 0.012),
        desktopSlitW: fs * 0.16,
        desktopCircleW: fs * 1.81,
        phonePillW: vw - 40,
        phonePillH: (vw - 40) / 1.85,
      };
    }

    // NexusCraft: NEXUS (~3.4em) + Pill (~3.2em) + CRAFT (~3.4em) = 10.0em
    // Strict calibration guarantees 0% overflow on 1024px, 1280px, 1366px, 1440px+
    const maxFsByWidth = (vw * 0.82) / 10.0;
    const maxFsByHeight = vh * 0.145;
    const fs = Math.max(38, Math.min(maxFsByWidth, maxFsByHeight));

    return {
      fs,
      desktopPillW: fs * 3.2,
      desktopHairlineW: Math.max(2, fs * 0.012),
      desktopSlitW: fs * 0.16,
      desktopCircleW: fs * 1.81,
      phonePillW: vw - 40,
      phonePillH: (vw - 40) / 1.85,
    };
  }, [displayMode]);

  // CTA Click: plays reverse collapse animation then smoothly scrolls down
  const handleStartProjectClick = useCallback(() => {
    if (isCollapsing) return;
    setIsCollapsing(true);

    const pillEl = pillHandlesRef.current?.pillElement;
    const overlayEl = pillHandlesRef.current?.overlayElement;
    const breezeEl = pillHandlesRef.current?.iconBreezeElement;
    const speakerEl = pillHandlesRef.current?.iconSpeakerElement;
    const navEl = navRef.current;
    const footerEl = footerHandlesRef.current?.footerElement;
    const bgEl = bgPaperRef.current;
    const rowEl = heroRowRef.current;
    const u = getUnitValues();

    if (!pillEl || !navEl || !footerEl || !bgEl || !rowEl) {
      const target = document.getElementById('how-it-works') || document.getElementById('features');
      target?.scrollIntoView({ behavior: 'smooth' });
      setIsCollapsing(false);
      return;
    }

    const duration = 1000;

    if (breezeEl) breezeEl.style.opacity = '0';
    if (speakerEl) speakerEl.style.opacity = '0';

    // Slide nav up
    navEl.animate([
      { transform: 'translateY(0)', opacity: 1 },
      { transform: 'translateY(-140%)', opacity: 0 }
    ], { duration: 400, fill: 'forwards' });

    // Slide footer down
    footerEl.animate([
      { transform: 'translateY(0)', opacity: 1 },
      { transform: 'translateY(160%)', opacity: 0 }
    ], { duration: 400, fill: 'forwards' });

    // Fade paper background
    bgEl.animate([
      { opacity: 1 },
      { opacity: 0 }
    ], { duration: 600, fill: 'forwards' });

    // Collapse pill width: stadium -> circle -> hairline
    pillEl.animate([
      { width: `${u.desktopPillW}px`, offset: 0 },
      { width: `${u.desktopCircleW}px`, offset: 0.4 },
      { width: `${u.desktopHairlineW}px`, offset: 0.8 },
      { width: `${u.desktopHairlineW}px`, clipPath: 'inset(50% 0)', offset: 1 }
    ], { duration, fill: 'forwards' });

    // Bring NEXUS and CRAFT together
    rowEl.animate([
      { gap: '0.085em', offset: 0 },
      { gap: '0.026em', offset: 0.8 },
      { gap: '0.026em', offset: 1 }
    ], { duration, fill: 'forwards' });

    if (overlayEl) {
      overlayEl.style.display = 'block';
      overlayEl.animate([
        { opacity: 0, offset: 0 },
        { opacity: 1, offset: 0.7 },
        { opacity: 1, offset: 1 }
      ], { duration, fill: 'forwards' });
    }

    setTimeout(() => {
      setIsCollapsing(false);
      const target = document.getElementById('how-it-works') || document.getElementById('features');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }, duration + 100);
  }, [getUnitValues, isCollapsing]);

  // Apply final state immediately for reduced-motion users
  const applyFinalState = useCallback(() => {
    const u = getUnitValues();
    if (bgPaperRef.current) bgPaperRef.current.style.opacity = '1';
    if (navRef.current) {
      navRef.current.style.transform = 'translateY(0)';
      navRef.current.style.opacity = '1';
    }
    if (footerHandlesRef.current?.footerElement) {
      footerHandlesRef.current.footerElement.style.transform = 'translateY(0)';
      footerHandlesRef.current.footerElement.style.opacity = '1';
    }
    if (footerHandlesRef.current?.ruleElement) {
      footerHandlesRef.current.ruleElement.style.transform = 'scaleX(1)';
    }

    const pillEl = pillHandlesRef.current?.pillElement;
    const overlayEl = pillHandlesRef.current?.overlayElement;
    const breezeEl = pillHandlesRef.current?.iconBreezeElement;
    const speakerEl = pillHandlesRef.current?.iconSpeakerElement;

    if (overlayEl) {
      overlayEl.style.opacity = '0';
      overlayEl.style.display = 'none';
    }
    if (breezeEl) breezeEl.style.opacity = '0.85';
    if (speakerEl) speakerEl.style.opacity = '0.85';

    if (pillEl) {
      pillEl.style.clipPath = 'inset(0)';
      if (!isPhone) {
        pillEl.style.width = `${u.desktopPillW}px`;
      } else {
        pillEl.style.width = `${u.phonePillW}px`;
        pillEl.style.height = `${u.phonePillH}px`;
      }
    }

    if (heroRowRef.current) {
      heroRowRef.current.style.gap = isPhone ? '0.10em' : '0.085em';
    }
  }, [getUnitValues, isPhone]);

  // Coordinated 2.1s Web Animations Timeline
  const createTimeline = useCallback(() => {
    const u = getUnitValues();
    const duration = 2100;
    const anims: Animation[] = [];

    const pillEl = pillHandlesRef.current?.pillElement;
    const overlayEl = pillHandlesRef.current?.overlayElement;
    const breezeEl = pillHandlesRef.current?.iconBreezeElement;
    const speakerEl = pillHandlesRef.current?.iconSpeakerElement;
    const navEl = navRef.current;
    const footerEl = footerHandlesRef.current?.footerElement;
    const ruleEl = footerHandlesRef.current?.ruleElement;
    const bgEl = bgPaperRef.current;
    const rowEl = heroRowRef.current;

    if (!pillEl || !overlayEl || !navEl || !footerEl || !ruleEl || !bgEl || !rowEl) {
      return anims;
    }

    if (!isPhone) {
      // ─────────────────────────────────────────────────────────────
      // DESKTOP: 5-STAGE MORPH
      // ─────────────────────────────────────────────────────────────

      // 1. Pill Width expansion (hairline -> slit -> circle -> stadium capsule)
      const pillWidthAnim = pillEl.animate([
        { width: `${u.desktopHairlineW}px`, offset: 0, easing: 'step-end' },
        { width: `${u.desktopHairlineW}px`, offset: 0.14, easing: 'cubic-bezier(.5,0,.3,1)' },
        { width: `${u.desktopSlitW}px`, offset: 0.30, easing: 'cubic-bezier(.45,0,.3,1)' },
        { width: `${u.desktopCircleW}px`, offset: 0.58, easing: 'cubic-bezier(.4,0,.2,1)' },
        { width: `${u.desktopPillW}px`, offset: 1.0 }
      ], { duration, fill: 'forwards' });
      anims.push(pillWidthAnim);

      // 2. Pill Clip (Hairline draws vertically from middle out 0 -> 14%)
      const pillClipAnim = pillEl.animate([
        { clipPath: 'inset(50% 0)', offset: 0, easing: 'linear' },
        { clipPath: 'inset(0% 0)', offset: 0.14 },
        { clipPath: 'inset(0% 0)', offset: 1.0 }
      ], { duration, fill: 'forwards' });
      anims.push(pillClipAnim);

      // 3. Word Gap between NEXUS and CRAFT (pushes outward)
      const gapAnim = rowEl.animate([
        { gap: '0.026em', offset: 0 },
        { gap: '0.026em', offset: 0.14, easing: 'linear' },
        { gap: '0.05em', offset: 0.58, easing: 'cubic-bezier(.4,0,.2,1)' },
        { gap: '0.085em', offset: 1.0 }
      ], { duration, fill: 'forwards' });
      anims.push(gapAnim);

    } else {
      // ─────────────────────────────────────────────────────────────
      // PHONE (≤ 720px): STACKED MORPH
      // ─────────────────────────────────────────────────────────────
      pillEl.style.width = `${u.phonePillW}px`;

      const pillHeightAnim = pillEl.animate([
        { height: '1.5px', offset: 0, easing: 'step-end' },
        { height: '1.5px', offset: 0.14, easing: 'cubic-bezier(.5,0,.3,1)' },
        { height: `${u.phonePillH * 0.10}px`, offset: 0.30, easing: 'cubic-bezier(.45,0,.3,1)' },
        { height: `${u.phonePillH * 0.55}px`, offset: 0.58, easing: 'cubic-bezier(.4,0,.2,1)' },
        { height: `${u.phonePillH}px`, offset: 1.0 }
      ], { duration, fill: 'forwards' });
      anims.push(pillHeightAnim);

      const pillClipPhoneAnim = pillEl.animate([
        { clipPath: 'inset(0 50%)', offset: 0, easing: 'linear' },
        { clipPath: 'inset(0 0%)', offset: 0.14 },
        { clipPath: 'inset(0 0%)', offset: 1.0 }
      ], { duration, fill: 'forwards' });
      anims.push(pillClipPhoneAnim);

      const phoneGapAnim = rowEl.animate([
        { gap: '0.03em', offset: 0 },
        { gap: '0.03em', offset: 0.14 },
        { gap: '0.06em', offset: 0.58 },
        { gap: '0.10em', offset: 1.0 }
      ], { duration, fill: 'forwards' });
      anims.push(phoneGapAnim);
    }

    if (overlayEl) {
      overlayEl.style.display = 'block';
    }

    // 4. Hairline Accent Overlay (Fades out 14% -> 30%)
    const overlayAnim = overlayEl.animate([
      { opacity: 1, offset: 0 },
      { opacity: 1, offset: 0.14, easing: 'cubic-bezier(.4,0,.2,1)' },
      { opacity: 0, offset: 0.30 },
      { opacity: 0, offset: 1.0 }
    ], { duration, fill: 'forwards' });
    anims.push(overlayAnim);

    // 5. Flowing Paper Background with white organic curves (fades in 45% -> 78%)
    const bgAnim = bgEl.animate([
      { opacity: 0, offset: 0 },
      { opacity: 0, offset: 0.45, easing: 'cubic-bezier(.3,0,.2,1)' },
      { opacity: 1, offset: 0.78 },
      { opacity: 1, offset: 1.0 }
    ], { duration, fill: 'forwards' });
    anims.push(bgAnim);

    // 6. Navigation: slides down from top (50% -> 86%)
    const navAnim = navEl.animate([
      { transform: 'translateY(-140%)', opacity: 0, offset: 0 },
      { transform: 'translateY(-140%)', opacity: 0, offset: 0.50, easing: 'cubic-bezier(.2,.8,.2,1)' },
      { transform: 'translateY(0)', opacity: 1, offset: 0.86 },
      { transform: 'translateY(0)', opacity: 1, offset: 1.0 }
    ], { duration, fill: 'forwards' });
    anims.push(navAnim);

    // 7. Footer: rises up from bottom (52% -> 90%)
    const footerAnim = footerEl.animate([
      { transform: 'translateY(160%)', opacity: 0, offset: 0 },
      { transform: 'translateY(160%)', opacity: 0, offset: 0.52, easing: 'cubic-bezier(.2,.8,.2,1)' },
      { transform: 'translateY(0)', opacity: 1, offset: 0.90 },
      { transform: 'translateY(0)', opacity: 1, offset: 1.0 }
    ], { duration, fill: 'forwards' });
    anims.push(footerAnim);

    // 8. Bottom 1px Rule across: scales horizontally (40% -> 95%)
    const ruleAnim = ruleEl.animate([
      { transform: 'scaleX(0)', offset: 0 },
      { transform: 'scaleX(0)', offset: 0.40, easing: 'cubic-bezier(.4,0,.2,1)' },
      { transform: 'scaleX(1)', offset: 0.95 },
      { transform: 'scaleX(1)', offset: 1.0 }
    ], { duration, fill: 'forwards' });
    anims.push(ruleAnim);

    // 9. Pill Icons Fade In after pill is wide (70% -> 95%)
    if (breezeEl) {
      const breezeAnim = breezeEl.animate([
        { opacity: 0, offset: 0 },
        { opacity: 0, offset: 0.70, easing: 'ease-out' },
        { opacity: 0.85, offset: 0.95 },
        { opacity: 0.85, offset: 1.0 }
      ], { duration, fill: 'forwards' });
      anims.push(breezeAnim);
    }

    if (speakerEl) {
      const speakerAnim = speakerEl.animate([
        { opacity: 0, offset: 0 },
        { opacity: 0, offset: 0.72, easing: 'ease-out' },
        { opacity: 0.85, offset: 0.96 },
        { opacity: 0.85, offset: 1.0 }
      ], { duration, fill: 'forwards' });
      anims.push(speakerAnim);
    }

    return anims;
  }, [getUnitValues, isPhone]);

  // Execute full reveal
  const runReveal = useCallback(() => {
    activeAnimationsRef.current.forEach(a => a.cancel());
    activeAnimationsRef.current = [];

    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      applyFinalState();
      return;
    }

    const anims = createTimeline();
    activeAnimationsRef.current = anims;
    if (anims.length > 0) {
      anims[0].onfinish = () => applyFinalState();
    }
    // Safety fallback ensures pill never gets stuck as a hairline
    const timer = setTimeout(applyFinalState, 2200);
    return () => clearTimeout(timer);
  }, [applyFinalState, createTimeline]);

  // Responsive resize & mode switch
  useEffect(() => {
    const handleResize = () => {
      const phone = window.innerWidth <= 720;
      setIsPhone(phone);
      if (containerRef.current) {
        const u = getUnitValues();
        containerRef.current.style.setProperty('--fs', `${u.fs}px`);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getUnitValues]);

  // Launch on font ready / mount / mode switch
  useEffect(() => {
    let cleanupTimer: (() => void) | undefined;
    const start = () => {
      const cleanup = runReveal();
      if (typeof cleanup === 'function') cleanupTimer = cleanup;
    };

    if ('fonts' in document) {
      document.fonts.ready.then(start);
    } else {
      start();
    }

    return () => {
      if (cleanupTimer) cleanupTimer();
      activeAnimationsRef.current.forEach(a => a.cancel());
    };
  }, [runReveal, displayMode]);

  const unitValues = getUnitValues();

  return (
    <section
      ref={containerRef}
      id="overview"
      className="relative w-full h-[100dvh] overflow-hidden bg-[#ffffff] select-none"
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        ['--fs' as any]: `${unitValues.fs}px`,
      }}
    >
      {/* Background Paper Layer with 15 Flowing Organic S-Curves */}
      <FlowingPaperBackground id="heroBgPaper" ref={bgPaperRef as any} />

      {/* Top Horizontal Navigation */}
      <HeroNavigation
        ref={navRef}
        displayMode={displayMode}
        onToggleMode={setDisplayMode}
      />

      {/* Hero Centerpiece: NEXUS [FLOATING ISLAND VIDEO PILL] CRAFT (or WI · PILL · LD) */}
      <div className="absolute top-[43%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full z-10 flex items-center justify-center text-center pointer-events-none px-4">
        <div
          ref={heroRowRef}
          id="heroRow"
          className={`flex items-center justify-center pointer-events-auto leading-[0.8] tracking-[-0.045em] font-[800] will-change-transform ${
            isPhone ? 'flex-col' : 'flex-row'
          }`}
          style={{
            fontSize: `var(--fs, ${unitValues.fs}px)`,
            gap: isPhone ? '0.03em' : '0.026em',
          }}
        >
          {/* Left Text */}
          <span className="text-[#1d1d1d] flex-shrink-0 select-none leading-[0.8] font-[800] tracking-[-0.045em] whitespace-nowrap">
            {displayMode === 'wild' ? 'WI' : 'NEXUS'}
          </span>

          {/* Central Stadium Pill with Floating Island Waterfall Loop Video */}
          <HeroVideoPill ref={pillHandlesRef} />

          {/* Right Text */}
          <span className="text-[#1d1d1d] flex-shrink-0 select-none leading-[0.8] font-[800] tracking-[-0.045em] whitespace-nowrap">
            {displayMode === 'wild' ? 'LD' : 'CRAFT'}
          </span>
        </div>
      </div>

      {/* Bottom Footer Bar with Drop-Cap, Rule, and Action */}
      <HeroFooter
        ref={footerHandlesRef}
        displayMode={displayMode}
        onSubmitIdea={handleStartProjectClick}
      />
    </section>
  );
};

export default NexusCraftPillHero;
