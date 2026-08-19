import React, { useEffect, useState } from 'react';

export const BackgroundVideo: React.FC = () => {
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    // Detect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Detect connection speed
    // @ts-ignore - navigator.connection is non-standard but widely supported in Chromium
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    let isSlowConnection = false;
    
    if (connection) {
      if (
        connection.saveData || 
        connection.effectiveType === 'slow-2g' || 
        connection.effectiveType === '2g' || 
        connection.effectiveType === '3g'
      ) {
        isSlowConnection = true;
      }
    }

    if (!prefersReducedMotion && !isSlowConnection) {
      setShouldLoadVideo(true);
    }
  }, []);

  return (
    <div className="absolute inset-0 z-0 w-full h-full overflow-hidden pointer-events-none">
      {shouldLoadVideo ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
          <source src="/videos/hero-bg.webm" type="video/webm" />
          {/* Fallback for browsers that don't support the video tag */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-900 to-slate-900" />
        </video>
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-900 to-slate-900" />
      )}
      
      {/* Dark overlay to ensure WCAG AA text contrast */}
      <div className="absolute inset-0 bg-slate-950/70" />
    </div>
  );
};
