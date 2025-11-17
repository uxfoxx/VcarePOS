import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useGSAP = (animationCallback, dependencies = []) => {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (ref.current) {
        animationCallback(ref.current);
      }
    }, ref);

    return () => ctx.revert();
  }, dependencies);

  return ref;
};

export const useScrollAnimation = (options = {}) => {
  const {
    trigger,
    start = 'top 80%',
    end = 'bottom 20%',
    scrub = false,
    markers = false,
    onEnter,
    onLeave,
    toggleActions = 'play none none reverse',
  } = options;

  const elementRef = useRef(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const animation = ScrollTrigger.create({
      trigger: trigger || elementRef.current,
      start,
      end,
      scrub,
      markers,
      onEnter,
      onLeave,
      toggleActions,
    });

    return () => animation.kill();
  }, [trigger, start, end, scrub, markers, onEnter, onLeave, toggleActions]);

  return elementRef;
};

export default useGSAP;
