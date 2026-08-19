import { useEffect } from 'react';
import { animate } from 'animejs/animation';
import { createScope } from 'animejs/scope';
import { onScroll } from 'animejs/events';
import { createDrawable } from 'animejs/svg';

const canUseMotion = () =>
  typeof window !== 'undefined' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const AnimeMotionScope = () => {
  useEffect(() => {
    if (!canUseMotion()) return;

    const scope = createScope({
      root: document.body,
      mediaQueries: {
        mobile: '(orientation: portrait), (hover: none), (pointer: coarse)',
        desktop: '(hover: hover) and (pointer: fine)',
      },
    }).add(() => {
      animate(createDrawable('.section-divider path'), {
        draw: ['0 0', '0 1', '1 1'],
        ease: 'inOut(3)',
        autoplay: onScroll({ sync: true }),
      });

      animate('.living-mesh', {
        '--mesh-hue': ['0deg', '36deg'],
        duration: 28000,
        loop: true,
        alternate: true,
        ease: 'inOutSine',
      });

      const meshShift = { y: 0 };
      animate(meshShift, {
        y: [0, 42],
        ease: 'linear',
        autoplay: onScroll({
          sync: true,
          onUpdate: (observer) => {
            document.documentElement.style.setProperty(
              '--mesh-scroll-y',
              `${observer.progress * 42}px`,
            );
          },
        }),
      });
    });

    return () => {
      scope.revert();
      document.documentElement.style.removeProperty('--mesh-scroll-y');
    };
  }, []);

  return null;
};
