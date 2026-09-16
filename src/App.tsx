import React, { useState, useEffect } from 'react';
import {
  QrCode,
  RotateCcw,
  Sparkles,
  Shield,
  Smartphone,
  Zap,
  Sun,
  Moon,
} from 'lucide-react';
import { QrConfig, QrHistoryItem, DownloadFormat } from './types';
import { DEFAULT_CONFIG } from './utils/qr';
import { useTheme } from './hooks/useTheme';
import { LiquidBackground } from './components/LiquidBackground';
import { UrlInputSection } from './components/UrlInputSection';
import { CustomizationPanel } from './components/CustomizationPanel';
import { QrPreviewCard } from './components/QrPreviewCard';
import { DownloadSection } from './components/DownloadSection';
import { RecentHistory } from './components/RecentHistory';

const HISTORY_STORAGE_KEY = 'liquid_qr_history';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [config, setConfig] = useState<QrConfig>(DEFAULT_CONFIG);
  const [history, setHistory] = useState<QrHistoryItem[]>([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // Storage error ignored
    }
  }, []);

  const saveHistoryItem = (urlToSave: string) => {
    if (!urlToSave.trim()) return;
    const newItem: QrHistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      url: urlToSave.trim(),
      timestamp: Date.now(),
      fgColor: config.fgColor,
      bgColor: config.bgColor,
    };

    setHistory((prev) => {
      // Filter out duplicate url if already in list
      const filtered = prev.filter((item) => item.url.toLowerCase() !== urlToSave.toLowerCase());
      const updated = [newItem, ...filtered].slice(0, 8);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Storage error ignored
      }
      return updated;
    });
  };

  const handleConfigChange = (updated: Partial<QrConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleUrlChange = (newUrl: string) => {
    setConfig((prev) => ({ ...prev, url: newUrl }));
  };

  const handleDownloadSuccess = (_format: DownloadFormat) => {
    saveHistoryItem(config.url);
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
  };

  const handleSelectHistory = (item: QrHistoryItem) => {
    setConfig((prev) => ({
      ...prev,
      url: item.url,
      fgColor: item.fgColor,
      bgColor: item.bgColor,
    }));
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      // Storage error ignored
    }
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-cyan-500/20 selection:text-cyan-800 dark:selection:text-cyan-200 transition-colors duration-200">
      <LiquidBackground />

      {/* Main Container */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Minimalist Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-sm">
              <QrCode className="w-5 h-5" />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
                QRGen
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Fast, high-resolution QR codes in PNG, JPG, and vector SVG
              </p>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>100% Client-side & Private</span>
            </div>

            {/* Theme Toggle Button */}
            <button
              id="theme-toggle-button"
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 transition-all active:scale-95 shadow-sm"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle light and dark theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-medium">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                  <span className="font-medium">Dark</span>
                </>
              )}
            </button>

            {/* Reset Button */}
            <button
              id="reset-config-button"
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 transition-all active:scale-95 shadow-sm"
              title="Reset to default settings"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Reset</span>
            </button>
          </div>
        </header>

        {/* Minimalist Workspace Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input, Customization, Downloads */}
          <div className="lg:col-span-7 space-y-6">
            {/* Input Card */}
            <section
              id="input-card"
              className="p-5 sm:p-7 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <UrlInputSection url={config.url} onChange={handleUrlChange} />
            </section>

            {/* Customization Card */}
            <section
              id="styling-card"
              className="p-5 sm:p-7 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
            >
              <CustomizationPanel config={config} onChange={handleConfigChange} />
            </section>

            {/* Download Action Card */}
            <section
              id="download-card"
              className="p-5 sm:p-7 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <DownloadSection config={config} onDownloaded={handleDownloadSuccess} />
            </section>

            {/* Recent History Tray */}
            <RecentHistory
              items={history}
              onSelect={handleSelectHistory}
              onClear={handleClearHistory}
            />
          </div>

          {/* Right Column: Floating QR Preview Dock (Sticky on Desktop) */}
          <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-4">
            <QrPreviewCard config={config} />

            {/* Quick Tips & Specs Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2.5">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-300 font-semibold">
                <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Format Guidelines</span>
              </div>
              <ul className="space-y-1.5 pl-1 text-[11px] leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="font-semibold text-cyan-700 dark:text-cyan-300 shrink-0">• SVG:</span>
                  <span>Ideal for print banners, merchandise, and vector editing. Never loses crispness.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-semibold text-cyan-700 dark:text-cyan-300 shrink-0">• PNG:</span>
                  <span>Perfect for presentations, web graphics, and supports transparent backgrounds.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-semibold text-cyan-700 dark:text-cyan-300 shrink-0">• JPG:</span>
                  <span>Great for standard photo galleries, quick emails, and general sharing.</span>
                </li>
              </ul>
            </div>

            {/* Scannability Guarantee */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <span>Universal Compatibility</span>
                  <Zap className="w-3 h-3" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Standard ISO/IEC 18004 compliant QR matrix scannable by iOS and Android camera apps.
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Minimalist Footer */}
      <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-slate-800 dark:text-slate-200">QRGen</span>
          <span>•</span>
          <span>Made by</span>
          <a
            id="author-linkedin-link"
            href="https://www.linkedin.com/in/gauravratnu/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium underline underline-offset-4 decoration-cyan-500/30 hover:decoration-cyan-500 transition-colors"
          >
            Gaurav Ratnu
          </a>
        </div>
        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-500">
          <span>100% Client-Side</span>
          <span>•</span>
          <span className="text-slate-700 dark:text-slate-400 font-medium">PNG • JPG • SVG • WebP</span>
        </div>
      </footer>
    </div>
  );
}
