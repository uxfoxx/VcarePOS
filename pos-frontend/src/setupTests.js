import '@testing-library/jest-dom';

// Polyfill window.matchMedia for components that rely on responsive observers
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// Provide a minimal getComputedStyle implementation used by some AntD utilities
if (typeof window !== 'undefined') {
  window.getComputedStyle = (elt) => ({
    getPropertyValue: (prop) => {
      // return reasonable defaults for properties used by rc-table / rc-util
      if (prop === 'box-sizing' || prop === 'boxSizing') return 'border-box';
      if (prop === 'direction') return 'ltr';
      if (prop === 'overflow-y' || prop === 'overflow') return 'scroll';
      return '';
    },
    overflow: 'scroll',
    boxSizing: 'border-box',
    direction: 'ltr'
  });

  // Alias computedStyle to getComputedStyle for libs that call window.computedStyle
  window.computedStyle = window.getComputedStyle;
}

// Alias computedStyle to getComputedStyle for libs that call window.computedStyle
if (typeof window !== 'undefined' && !window.computedStyle) {
  window.computedStyle = window.getComputedStyle;
}

// Ensure document.createRange exists for some libs
if (typeof document !== 'undefined' && !document.createRange) {
  document.createRange = () => ({
    setStart: () => {},
    setEnd: () => {},
    commonAncestorContainer: document.body,
  });
}
