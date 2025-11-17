import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const animationConfig = {
  duration: 0.8,
  ease: 'power3.out',
  stagger: 0.15,
  scrollStart: 'top 80%',
  scrollEnd: 'bottom 20%',
};

export const fadeInUp = (element, options = {}) => {
  const { delay = 0, duration = animationConfig.duration, y = 50 } = options;

  return gsap.from(element, {
    opacity: 0,
    y,
    duration,
    delay,
    ease: animationConfig.ease,
    scrollTrigger: {
      trigger: element,
      start: animationConfig.scrollStart,
      toggleActions: 'play none none reverse',
    },
  });
};

export const fadeIn = (element, options = {}) => {
  const { delay = 0, duration = animationConfig.duration } = options;

  return gsap.from(element, {
    opacity: 0,
    duration,
    delay,
    ease: animationConfig.ease,
    scrollTrigger: {
      trigger: element,
      start: animationConfig.scrollStart,
      toggleActions: 'play none none reverse',
    },
  });
};

export const slideInLeft = (element, options = {}) => {
  const { delay = 0, duration = animationConfig.duration, x = -100 } = options;

  return gsap.from(element, {
    opacity: 0,
    x,
    duration,
    delay,
    ease: animationConfig.ease,
    scrollTrigger: {
      trigger: element,
      start: animationConfig.scrollStart,
      toggleActions: 'play none none reverse',
    },
  });
};

export const slideInRight = (element, options = {}) => {
  const { delay = 0, duration = animationConfig.duration, x = 100 } = options;

  return gsap.from(element, {
    opacity: 0,
    x,
    duration,
    delay,
    ease: animationConfig.ease,
    scrollTrigger: {
      trigger: element,
      start: animationConfig.scrollStart,
      toggleActions: 'play none none reverse',
    },
  });
};

export const staggerFadeInUp = (elements, options = {}) => {
  const {
    delay = 0,
    duration = animationConfig.duration,
    stagger = animationConfig.stagger,
    y = 50,
  } = options;

  return gsap.from(elements, {
    opacity: 0,
    y,
    duration,
    delay,
    stagger,
    ease: animationConfig.ease,
    scrollTrigger: {
      trigger: elements[0],
      start: animationConfig.scrollStart,
      toggleActions: 'play none none reverse',
    },
  });
};

export const scaleIn = (element, options = {}) => {
  const { delay = 0, duration = animationConfig.duration, scale = 0.8 } = options;

  return gsap.from(element, {
    opacity: 0,
    scale,
    duration,
    delay,
    ease: 'back.out(1.7)',
    scrollTrigger: {
      trigger: element,
      start: animationConfig.scrollStart,
      toggleActions: 'play none none reverse',
    },
  });
};

export const parallaxScroll = (element, options = {}) => {
  const { speed = 0.5 } = options;

  return gsap.to(element, {
    y: () => window.innerHeight * speed,
    ease: 'none',
    scrollTrigger: {
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });
};

export const createTimeline = (options = {}) => {
  return gsap.timeline(options);
};

export const rotateIn = (element, options = {}) => {
  const { delay = 0, duration = animationConfig.duration, rotation = 180 } = options;

  return gsap.from(element, {
    opacity: 0,
    rotation,
    duration,
    delay,
    ease: 'back.out(1.7)',
    scrollTrigger: {
      trigger: element,
      start: animationConfig.scrollStart,
      toggleActions: 'play none none reverse',
    },
  });
};

export const counterAnimation = (element, endValue, options = {}) => {
  const { duration = 2, delay = 0 } = options;

  const obj = { value: 0 };

  return gsap.to(obj, {
    value: endValue,
    duration,
    delay,
    ease: 'power1.out',
    onUpdate: () => {
      element.textContent = Math.round(obj.value);
    },
    scrollTrigger: {
      trigger: element,
      start: animationConfig.scrollStart,
      toggleActions: 'play none none reverse',
    },
  });
};
