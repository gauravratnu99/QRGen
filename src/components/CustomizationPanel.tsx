import React from 'react';
import { Palette, ShieldCheck, Maximize2, Layers, Check } from 'lucide-react';
import { QrConfig, ErrorCorrectionLevel, ExportResolution } from '../types';
import { COLOR_PRESETS } from '../utils/qr';

interface CustomizationPanelProps {
  config: QrConfig;
  onChange: (updated: Partial<QrConfig>) => void;
}

const ERROR_CORRECTION_OPTIONS: { level: ErrorCorrectionLevel; label: string; desc: string }[] = [
  { level: 'L', label: '7% (Low)', desc: 'Smallest code size' },
  { level: 'M', label: '15% (Medium)', desc: 'Standard balance' },
  { level: 'Q', label: '25% (High)', desc: 'Good for print' },
  { level: 'H', label: '30% (Max)', desc: 'Best redundancy' },
];

const RESOLUTION_OPTIONS: { res: ExportResolution; label: string; detail: string }[] = [
  { res: 512, label: '512px', detail: 'Web / Social' },
  { res: 1024, label: '1024px', detail: 'HD Screen' },
  { res: 2048, label: '2048px', detail: 'Print / 4K' },
];

export const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ config, onChange }) => {
  return (
    <div id="customization-panel" className="space-y-6">
      {/* Color Customization */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
            <span>Color Palette for QR Code</span>
          </label>
        </div>

        {/* Liquid Presets */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {COLOR_PRESETS.map((preset) => {
            const isSelected =
              config.fgColor.toLowerCase() === preset.fg.toLowerCase() &&
              config.bgColor.toLowerCase() === preset.bg.toLowerCase() &&
              !config.transparentBg;

            return (
              <button
                key={preset.name}
                id={`color-preset-${preset.name.toLowerCase().replace(/\s+/g, '-')}`}
                type="button"
                onClick={() =>
                  onChange({
                    fgColor: preset.fg,
                    bgColor: preset.bg,
                    transparentBg: false,
                  })
                }
                className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border transition-all text-left ${
                  isSelected
                    ? 'bg-cyan-500/10 dark:bg-white/10 border-cyan-500 dark:border-cyan-400 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                }`}
                title={preset.name}
              >
                <div
                  className="w-full h-7 rounded-lg flex items-center justify-center relative overflow-hidden shadow-inner border border-slate-200/50 dark:border-transparent"
                  style={{ backgroundColor: preset.bg }}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-sm shadow-sm"
                    style={{ backgroundColor: preset.fg }}
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-cyan-500/15 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-slate-900 drop-shadow" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 truncate w-full text-center font-medium">
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom Color Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Foreground color */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5">
            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">QR Pattern Color</span>
            <div className="flex items-center gap-2">
              <input
                id="fg-color-picker"
                type="color"
                value={config.fgColor}
                onChange={(e) => onChange({ fgColor: e.target.value })}
                className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0 p-0"
              />
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-semibold">
                {config.fgColor}
              </span>
            </div>
          </div>

          {/* Background color */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Background</span>
              <button
                type="button"
                id="toggle-transparent-bg"
                onClick={() => onChange({ transparentBg: !config.transparentBg })}
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium border transition-colors ${
                  config.transparentBg
                    ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/40'
                    : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-white/10 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {config.transparentBg ? 'Transparent (ON)' : 'Solid'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="bg-color-picker"
                type="color"
                value={config.bgColor}
                disabled={config.transparentBg}
                onChange={(e) => onChange({ bgColor: e.target.value, transparentBg: false })}
                className={`w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0 p-0 ${
                  config.transparentBg ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              />
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-semibold">
                {config.transparentBg ? 'Alpha' : config.bgColor}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Margins & Error Correction Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Margin / Quiet Zone */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
              <span>Quiet Zone (Border)</span>
            </label>
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-medium">{config.margin} blocks</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-xl">
            {[1, 2, 3, 4].map((m) => (
              <button
                key={m}
                id={`margin-btn-${m}`}
                type="button"
                onClick={() => onChange({ margin: m })}
                className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                  config.margin === m
                    ? 'bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-cyan-500/40 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {m === 1 ? 'Compact' : m === 2 ? 'Normal' : m === 3 ? 'Spacious' : 'Wide'}
              </button>
            ))}
          </div>
        </div>

        {/* Error Correction */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
              <span>Redundancy Level</span>
            </label>
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-medium">
              Level {config.errorCorrectionLevel}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-xl">
            {ERROR_CORRECTION_OPTIONS.map((opt) => (
              <button
                key={opt.level}
                id={`error-correction-${opt.level}`}
                type="button"
                onClick={() => onChange({ errorCorrectionLevel: opt.level })}
                title={`${opt.label} - ${opt.desc}`}
                className={`py-1.5 text-xs font-medium rounded-lg transition-all text-center ${
                  config.errorCorrectionLevel === opt.level
                    ? 'bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-cyan-500/40 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>{opt.level}</span>
                <span className="hidden sm:inline text-[10px] text-slate-400 dark:text-slate-500 block">
                  {opt.level === 'L' ? '7%' : opt.level === 'M' ? '15%' : opt.level === 'Q' ? '25%' : '30%'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Export Raster Resolution */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
            <span>Raster Image Resolution</span>
          </label>
          <span className="text-xs text-slate-500 dark:text-slate-400">(SVG is always vector)</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {RESOLUTION_OPTIONS.map((item) => (
            <button
              key={item.res}
              id={`resolution-btn-${item.res}`}
              type="button"
              onClick={() => onChange({ resolution: item.res })}
              className={`p-2 rounded-xl border text-left transition-all ${
                config.resolution === item.res
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-800 dark:text-cyan-300 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/15 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.label}</div>
              <div className="text-[10px] text-slate-500">{item.detail}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
