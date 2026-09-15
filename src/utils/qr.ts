import QRCode from 'qrcode';
import { QrConfig, DownloadFormat } from '../types';

export const DEFAULT_CONFIG: QrConfig = {
  url: 'https://github.com',
  fgColor: '#0f172a',
  bgColor: '#ffffff',
  transparentBg: false,
  errorCorrectionLevel: 'M',
  margin: 2,
  resolution: 1024,
};

export const COLOR_PRESETS = [
  { name: 'Classic Slate', fg: '#0f172a', bg: '#ffffff', accent: '#3b82f6' },
  { name: 'Liquid Ocean', fg: '#0369a1', bg: '#f0f9ff', accent: '#0284c7' },
  { name: 'Emerald Forest', fg: '#064e3b', bg: '#f0fdf4', accent: '#10b981' },
  { name: 'Midnight Violet', fg: '#3b0764', bg: '#faf5ff', accent: '#a855f7' },
  { name: 'Sunset Amber', fg: '#7c2d12', bg: '#fffbeb', accent: '#f97316' },
  { name: 'Cyber Neon', fg: '#38bdf8', bg: '#020617', accent: '#06b6d4' },
];

/**
 * Validates whether the given string looks like a valid URL or URI.
 */
export function isValidUrl(input: string): boolean {
  if (!input || !input.trim()) return false;
  const trimmed = input.trim();
  try {
    const parsed = new URL(trimmed);
    return Boolean(parsed.protocol);
  } catch {
    // Also accept common formats like www.example.com or domain.com
    const domainRegex = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
    return domainRegex.test(trimmed);
  }
}

/**
 * Normalizes user input into a clickable URL
 */
export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (/^[a-zA-Z]+:\/\//.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Generates an SVG string representation of the QR code
 */
export async function generateQrSvg(config: QrConfig): Promise<string> {
  const targetUrl = config.url.trim() || 'https://google.com';
  const lightColor = config.transparentBg ? '#00000000' : config.bgColor;

  return QRCode.toString(targetUrl, {
    type: 'svg',
    errorCorrectionLevel: config.errorCorrectionLevel,
    margin: config.margin,
    color: {
      dark: config.fgColor,
      light: lightColor,
    },
  });
}

/**
 * Renders the QR code onto a Canvas element
 */
export async function renderQrToCanvas(
  canvas: HTMLCanvasElement,
  config: QrConfig,
  targetWidth?: number
): Promise<void> {
  const width = targetWidth || config.resolution;
  const targetUrl = config.url.trim() || 'https://google.com';
  const lightColor = config.transparentBg ? '#00000000' : config.bgColor;

  await QRCode.toCanvas(canvas, targetUrl, {
    width,
    errorCorrectionLevel: config.errorCorrectionLevel,
    margin: config.margin,
    color: {
      dark: config.fgColor,
      light: lightColor,
    },
  });
}

/**
 * Downloads the QR code in the specified format (png, jpg, svg, webp)
 */
export async function downloadQr(config: QrConfig, format: DownloadFormat): Promise<void> {
  const sanitizedFilename = `qrcode-${Date.now()}.${format}`;
  const targetUrl = config.url.trim() || 'https://google.com';

  if (format === 'svg') {
    const svgString = await generateQrSvg(config);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    triggerDownload(blob, sanitizedFilename);
    return;
  }

  // For raster formats (PNG, JPG, WebP)
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = config.resolution;
  offscreenCanvas.height = config.resolution;

  // JPG requires an opaque background to prevent black transparency rendering
  const lightColor =
    format === 'jpg' || !config.transparentBg ? config.bgColor || '#ffffff' : '#00000000';

  await QRCode.toCanvas(offscreenCanvas, targetUrl, {
    width: config.resolution,
    errorCorrectionLevel: config.errorCorrectionLevel,
    margin: config.margin,
    color: {
      dark: config.fgColor,
      light: lightColor,
    },
  });

  const mimeType =
    format === 'jpg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
  const quality = format === 'jpg' ? 0.95 : 1.0;

  offscreenCanvas.toBlob(
    (blob) => {
      if (blob) {
        triggerDownload(blob, sanitizedFilename);
      }
    },
    mimeType,
    quality
  );
}

/**
 * Copies the QR code PNG image to the system clipboard
 */
export async function copyQrToClipboard(config: QrConfig): Promise<boolean> {
  try {
    const targetUrl = config.url.trim() || 'https://google.com';
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = 1024;
    offscreenCanvas.height = 1024;

    const lightColor = config.transparentBg ? '#00000000' : config.bgColor;

    await QRCode.toCanvas(offscreenCanvas, targetUrl, {
      width: 1024,
      errorCorrectionLevel: config.errorCorrectionLevel,
      margin: config.margin,
      color: {
        dark: config.fgColor,
        light: lightColor,
      },
    });

    return new Promise((resolve) => {
      offscreenCanvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        try {
          if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
            resolve(true);
          } else {
            resolve(false);
          }
        } catch {
          resolve(false);
        }
      }, 'image/png');
    });
  } catch {
    return false;
  }
}

/**
 * Triggers a file download in the browser
 */
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
