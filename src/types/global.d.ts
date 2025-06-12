// Extend the Window interface to include rdt
declare global {
  interface Window {
    rdt?: (...args: any[]) => void;
  }
}

// Export {} to make it a module, which can sometimes help with global declarations.
export {};
