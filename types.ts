export enum AudioSourceType {
  MICROPHONE = 'MICROPHONE',
  FILE = 'FILE',
  NONE = 'NONE'
}

export interface OpalTheme {
  colors: string[]; // Array of Hex strings (1-5 colors)
  speedModifier: number;
  id?: string;
  name?: string;
  description?: string;
  baseColor?: string;
  roughness?: number;
  metalness?: number;
  bgGradient?: string[];
  particleColor?: string;
  accentColors?: string[];
}

export interface AudioState {
  isPlaying: boolean;
  volume: number;
  sourceType: AudioSourceType;
  analyser: AnalyserNode | null;
  dataArray: Uint8Array | null;
  sensitivity: number;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}