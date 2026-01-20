export enum ModelType {
  FLASH = 'gemini-2.5-flash-image',
  PRO = 'gemini-3-pro-image-preview',
}

export enum AspectRatio {
  SQUARE = '1:1',
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
  WIDE = '4:3',
  TALL = '3:4',
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
  model: ModelType;
}

// Augment the global AIStudio interface.
// This interface is used by the existing window.aistudio declaration in the environment.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}
