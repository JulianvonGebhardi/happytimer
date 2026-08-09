/**
 * Type declarations for webextension-polyfill
 * Provides TypeScript types for browser extension APIs
 */

import 'webextension-polyfill';

// Extend the Window interface for browser extension APIs
declare global {
  interface Window {
    browser: typeof import('webextension-polyfill');
  }
}

// Type definitions for custom extension types
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.wav' {
  const content: string;
  export default content;
}

declare module '*.ttf' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const content: { [key: string]: string };
  export default content;
}
