import React, { useState } from 'react';
import { Link2, Clipboard, X, ExternalLink, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { isValidUrl, normalizeUrl } from '../utils/qr';

interface UrlInputSectionProps {
  url: string;
  onChange: (url: string) => void;
}

const PRESET_URLS = [
  { label: 'GitHub', url: 'https://github.com' },
  { label: 'Wikipedia', url: 'https://wikipedia.org' },
  { label: 'YouTube', url: 'https://youtube.com' },
  { label: 'Spotify', url: 'https://spotify.com' },
];

export const UrlInputSection: React.FC<UrlInputSectionProps> = ({ url, onChange }) => {
  const [pasteFeedback, setPasteFeedback] = useState(false);
  const isValid = isValidUrl(url);
  const normalized = normalizeUrl(url);

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          onChange(text.trim());
          setPasteFeedback(true);
          setTimeout(() => setPasteFeedback(false), 1500);
        }
      }
    } catch {
      // Clipboard access denied or unsupported
    }
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div id="url-input-container" className="space-y-3">
      <div className="flex items-center justify-between">
        <label
          htmlFor="qr-url-input"
          className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5"
        >
          <Link2 className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
          <span>Target URL or Link</span>
        </label>
        
        {url && (
          <span
            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-colors ${
              isValid
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
            }`}
          >
            {isValid ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>Ready to scan</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3" />
                <span>Text string</span>
              </>
            )}
          </span>
        )}
      </div>

      {/* Minimalist Input Field */}
      <div className="relative">
        <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 transition-all focus-within:border-cyan-500 dark:focus-within:border-cyan-500/70 focus-within:ring-1 focus-within:ring-cyan-500/30">
          <div className="text-slate-400 mr-3 shrink-0">
            <Link2 className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
          </div>

          <input
            id="qr-url-input"
            type="text"
            value={url}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste or enter any link (e.g., https://yourwebsite.com)"
            className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm md:text-base focus:outline-none font-medium selection:bg-cyan-500/30"
            autoComplete="off"
            spellCheck="false"
          />

          <div className="flex items-center gap-1.5 ml-2 shrink-0">
            {url && (
              <button
                id="clear-url-button"
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                title="Clear input"
                aria-label="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              id="paste-clipboard-button"
              type="button"
              onClick={handlePaste}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                pasteFeedback
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-300/80 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Paste from clipboard"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{pasteFeedback ? 'Pasted!' : 'Paste'}</span>
            </button>

            {isValid && (
              <a
                id="visit-link-anchor"
                href={normalized}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                title="Open and test link in new tab"
                aria-label="Open link in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Quick Example Presets */}
      <div className="flex items-center gap-2 pt-1 flex-wrap">
        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-500 dark:text-cyan-400" />
          <span>Quick test:</span>
        </span>
        {PRESET_URLS.map((preset) => (
          <button
            key={preset.label}
            id={`preset-btn-${preset.label.toLowerCase()}`}
            type="button"
            onClick={() => onChange(preset.url)}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
              url === preset.url
                ? 'bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 dark:border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                : 'bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};
