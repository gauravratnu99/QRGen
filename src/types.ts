export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type DownloadFormat = 'png' | 'jpg' | 'svg' | 'webp';

export type ExportResolution = 512 | 1024 | 2048;

export interface QrConfig {
  url: string;
  fgColor: string;
  bgColor: string;
  transparentBg: boolean;
  errorCorrectionLevel: ErrorCorrectionLevel;
  margin: number;
  resolution: ExportResolution;
}

export interface QrHistoryItem {
  id: string;
  url: string;
  timestamp: number;
  fgColor: string;
  bgColor: string;
}

export interface ColorPreset {
  name: string;
  fg: string;
  bg: string;
  accent: string;
}
