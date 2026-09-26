import React, { useState } from 'react';
import { Download, Check, Sparkles, FileImage, Layers } from 'lucide-react';
import { QrConfig, DownloadFormat } from '../types';
import { downloadQr } from '../utils/qr';

interface DownloadSectionProps {
  config: QrConfig;
  onDownloaded?: (format: DownloadFormat) => void;
}

interface FormatOption {
  format: DownloadFormat;
  label: string;
  badge: string;
  description: string;
  recommendedFor: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    format: 'png',
    label: 'PNG Image',
    badge: 'Lossless',
    description: 'Crisp raster with alpha transparency',
    recommendedFor: 'Apps, Web & Digital',
  },
  {
    format: 'jpg',
    label: 'JPG Image',
    badge: 'Universal',
    description: 'High compatibility solid background',
    recommendedFor: 'Social & Quick Sharing',
  },
  {
    format: 'svg',
    label: 'SVG Vector',
    badge: 'Infinite Scale',
    description: 'Pure vector math without pixels',
    recommendedFor: 'Billboards, Print & Figma',
  },
  {
    format: 'webp',
    label: 'WebP Image',
    badge: 'Modern',
    description: 'Compact next-gen web image',
    recommendedFor: 'Web Optimization',
  },
];

export const DownloadSection: React.FC<DownloadSectionProps> = ({ config, onDownloaded }) => {
  const [downloadingFormat, setDownloadingFormat] = useState<DownloadFormat | 'all' | null>(null);
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);

  const handleDownload = async (format: DownloadFormat) => {
    try {
      setDownloadingFormat(format);
      await downloadQr(config, format);
      setDownloadedFormat(format);
      onDownloaded?.(format);
      setTimeout(() => setDownloadedFormat(null), 2500);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handleDownloadAll = async () => {
    try {
      setDownloadingFormat('all');
      // Download PNG, JPG, SVG, and WebP in sequence
      await downloadQr(config, 'png');
      await new Promise((r) => setTimeout(r, 200));
      await downloadQr(config, 'jpg');
      await new Promise((r) => setTimeout(r, 200));
      await downloadQr(config, 'svg');
      await new Promise((r) => setTimeout(r, 200));
      await downloadQr(config, 'webp');
      setDownloadedFormat('all');
      onDownloaded?.('png');
      setTimeout(() => setDownloadedFormat(null), 2500);
    } catch (err) {
      console.error('Batch download error:', err);
    } finally {
      setDownloadingFormat(null);
    }
  };

  return (
    <div id="download-section-container" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Download className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
            <span>Download Formats</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Export ready-to-use image files with custom styling applied
          </p>
        </div>

        <button
          id="download-all-formats-btn"
          type="button"
          onClick={handleDownloadAll}
          disabled={downloadingFormat !== null}
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 transition-all hover:shadow-lg hover:shadow-cyan-500/10 active:scale-95 disabled:opacity-50"
        >
          {downloadingFormat === 'all' ? (
            <div className="w-3.5 h-3.5 border-2 border-cyan-500 dark:border-cyan-400 border-t-transparent rounded-full animate-spin" />
          ) : downloadedFormat === 'all' ? (
            <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
          )}
          <span>{downloadedFormat === 'all' ? 'All Downloaded!' : 'Download All (PNG + JPG + SVG + WebP)'}</span>
        </button>
      </div>

      {/* Grid of download formats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FORMAT_OPTIONS.map((opt) => {
          const isProcessing = downloadingFormat === opt.format;
          const isDone = downloadedFormat === opt.format;

          return (
            <button
              key={opt.format}
              id={`download-btn-${opt.format}`}
              type="button"
              onClick={() => handleDownload(opt.format)}
              disabled={downloadingFormat !== null}
              className={`group relative flex items-start justify-between p-4 rounded-2xl border text-left transition-all duration-200 ${
                isDone
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800/80 border-slate-200 dark:border-white/5 hover:border-cyan-500/40 hover:shadow-md hover:shadow-cyan-500/5 active:scale-[0.99]'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-200/60 dark:bg-white/5 group-hover:bg-cyan-500/10 text-slate-600 dark:text-slate-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                    {opt.format === 'svg' ? (
                      <Layers className="w-4 h-4" />
                    ) : (
                      <FileImage className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-cyan-700 dark:group-hover:text-cyan-200 transition-colors">
                    {opt.label}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${
                      opt.format === 'svg'
                        ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20'
                        : opt.format === 'png'
                        ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20'
                        : opt.format === 'webp'
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                        : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {opt.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 pl-8">{opt.description}</p>
                <div className="text-[11px] text-cyan-600 dark:text-cyan-400/80 pl-8 font-medium">
                  {opt.recommendedFor}
                </div>
              </div>

              <div className="ml-2 pt-1 shrink-0">
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-cyan-500 dark:border-cyan-400 border-t-transparent rounded-full animate-spin" />
                ) : isDone ? (
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-300 animate-in zoom-in">
                    <Check className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-xl bg-slate-200/60 dark:bg-white/5 group-hover:bg-cyan-500/20 border border-slate-300/60 dark:border-white/10 group-hover:border-cyan-500/30 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-all">
                    <Download className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Mobile Download All Button */}
      <button
        id="download-all-mobile-btn"
        type="button"
        onClick={handleDownloadAll}
        disabled={downloadingFormat !== null}
        className="sm:hidden w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-semibold text-cyan-800 dark:text-cyan-200 transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {downloadingFormat === 'all' ? (
          <div className="w-4 h-4 border-2 border-cyan-500 dark:border-cyan-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
        )}
        <span>Download All Formats (PNG, JPG, SVG, WebP)</span>
      </button>
    </div>
  );
};
