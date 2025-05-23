// Extend the Window interface to include rdt ( reddit pixels)
declare global {
  interface Window {
    rdt?: (...args: any[]) => void;
  }
}

export {};