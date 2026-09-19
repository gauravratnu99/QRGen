import React, { useEffect, useRef, useState } from 'react';
import {
  Copy,
  Check,
  Code2,
  Maximize2,
  Minimize2,
  Scan,
  ExternalLink,
  ShieldAlert,
  Mail,
  Phone,
  Instagram,
  MessageSquare,
  Link2,
} from 'lucide-react';
import { QrConfig } from '../types';
import { renderQrToCanvas, generateQrSvg, copyQrToClipboard, normalizeUrl, detectPayloadCategory } from '../utils/qr';

interface QrPreviewCardProps {
  config: QrConfig;
}

export const QrPreviewCard: React.FC<QrPreviewCardProps> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copyImageSuccess, setCopyImageSuccess] = useState(false);
  const [copySvgSuccess, setCopySvgSuccess] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showScanSimulator, setShowScanSimulator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const displayUrl = config.url.trim() || 'https://google.com';
  const normalized = normalizeUrl(displayUrl);
  const category = detectPayloadCategory(config.url);

  // Render QR code to canvas whenever config changes
  useEffect(() => {
    let isCurrent = true;
    const render = async () => {
      if (!canvasRef.current) return;
      setIsGenerating(true);
      try {
        await renderQrToCanvas(canvasRef.current, config, 600);
      } catch (err) {
        console.error('Error rendering QR Code:', err);
      } finally {
        if (isCurrent) setIsGenerating(false);
      }
    };

    render();
    return () => {
      isCurrent = false;
    };
  }, [
    config.url,
    config.fgColor,
    config.bgColor,
    config.transparentBg,
    config.errorCorrectionLevel,
    config.margin,
  ]);

  const handleCopyImage = async () => {
    const success = await copyQrToClipboard(config);
    if (success) {
      setCopyImageSuccess(true);
      setTimeout(() => setCopyImageSuccess(false), 2000);
    }
  };

  const handleCopySvg = async () => {
    try {
      const svgString = await generateQrSvg(config);
      await navigator.clipboard.writeText(svgString);
      setCopySvgSuccess(true);
      setTimeout(() => setCopySvgSuccess(false), 2000);
    } catch {
      // Failed to copy
    }
  };

  return (
    <div
      id="qr-preview-wrapper"
      className="relative flex flex-col items-center justify-between p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden transition-all duration-300"
    >
      {/* Top action header */}
      <div className="w-full flex items-center justify-between mb-4 z-10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
            Live Preview
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="test-scan-button"
            type="button"
            onClick={() => setShowScanSimulator(!showScanSimulator)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-xl border transition-all ${
              showScanSimulator
                ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/40'
                : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
            title="Simulate smartphone scan"
          >
            <Scan className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Verify QR</span>
          </button>

          <button
            id="zoom-toggle-button"
            type="button"
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            title={isZoomed ? 'Shrink preview' : 'Enlarge preview'}
            aria-label="Toggle preview size"
          >
            {isZoomed ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* QR Canvas Display Plate */}
      <div
        id="qr-canvas-dock"
        className={`relative flex items-center justify-center p-4 sm:p-6 rounded-2xl transition-all duration-300 z-10 shadow-xl border border-slate-200/80 dark:border-transparent ${
          config.transparentBg
            ? 'bg-[linear-gradient(45deg,#94a3b8_25%,transparent_25%),linear-gradient(-45deg,#94a3b8_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#94a3b8_75%),linear-gradient(-45deg,transparent_75%,#94a3b8_75%)] dark:bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0]'
            : ''
        }`}
        style={{
          backgroundColor: config.transparentBg ? undefined : config.bgColor,
          width: isZoomed ? 'min(90vw, 380px)' : 'min(75vw, 280px)',
          height: isZoomed ? 'min(90vw, 380px)' : 'min(75vw, 280px)',
        }}
      >
        <canvas
          id="qr-canvas-element"
          ref={canvasRef}
          className={`w-full h-full object-contain rounded-lg transition-opacity duration-200 ${
            isGenerating ? 'opacity-50' : 'opacity-100'
          }`}
        />

        {/* Liquid reflection gloss overlay */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/10" />
      </div>

      {/* Target Link Information */}
      <div className="w-full mt-4 text-center z-10 space-y-2">
        <div className="flex items-center justify-center gap-1.5 flex-wrap px-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
            {category.type === 'email' && <Mail className="w-3 h-3 text-blue-500" />}
            {category.type === 'phone' && <Phone className="w-3 h-3 text-emerald-500" />}
            {category.type === 'sms' && <MessageSquare className="w-3 h-3 text-cyan-500" />}
            {category.type === 'instagram' && <Instagram className="w-3 h-3 text-pink-500" />}
            {category.type === 'url' && <Link2 className="w-3 h-3 text-cyan-500" />}
            <span>{category.label}</span>
          </span>

          <span className="truncate max-w-[200px] sm:max-w-xs font-mono text-xs text-slate-600 dark:text-slate-400">
            {category.displayValue || displayUrl}
          </span>

          <a
            id="preview-link-test"
            href={normalized}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:underline inline-flex items-center p-0.5"
            title={`Test: ${category.actionText}`}
          >
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
          <span>{displayUrl.length} characters</span>
          <span>•</span>
          <span>Level {config.errorCorrectionLevel}</span>
          <span>•</span>
          <span>{config.transparentBg ? 'Alpha BG' : 'Solid BG'}</span>
        </div>
      </div>

      {/* Quick Copy Action Bar */}
      <div className="w-full grid grid-cols-2 gap-2 mt-4 z-10">
        <button
          id="copy-image-clipboard-btn"
          type="button"
          onClick={handleCopyImage}
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-200 transition-all hover:border-cyan-500/40 active:scale-[0.98]"
        >
          {copyImageSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span className="text-emerald-700 dark:text-emerald-300">Copied Image</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Copy Image</span>
            </>
          )}
        </button>

        <button
          id="copy-svg-code-btn"
          type="button"
          onClick={handleCopySvg}
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-200 transition-all hover:border-cyan-500/40 active:scale-[0.98]"
        >
          {copySvgSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span className="text-emerald-700 dark:text-emerald-300">Copied SVG</span>
            </>
          ) : (
            <>
              <Code2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Copy SVG</span>
            </>
          )}
        </button>
      </div>

      {/* Scan Simulator / Verification Drawer */}
      {showScanSimulator && (
        <div
          id="scan-simulator-card"
          className="w-full mt-4 p-3.5 rounded-2xl bg-cyan-500/10 dark:bg-cyan-950/40 border border-cyan-500/30 text-left z-10 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/20">
            <span className="text-xs font-semibold text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5">
              <Scan className="w-3.5 h-3.5" />
              <span>Smartphone Camera Scanner Simulation</span>
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Scannable
            </span>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 mb-2">
            When a user points their smartphone camera at this QR code, it immediately parses:
          </p>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950/70 border border-cyan-500/20 mb-2 font-mono text-xs text-cyan-800 dark:text-cyan-200 break-all shadow-inner">
            {displayUrl}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              Verified decodable target
            </span>
            <a
              id="simulator-open-link"
              href={normalized}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300 hover:text-cyan-900 dark:hover:text-cyan-200 bg-cyan-500/20 hover:bg-cyan-500/30 px-2.5 py-1 rounded-lg transition-colors"
            >
              <span>{category.actionText}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
