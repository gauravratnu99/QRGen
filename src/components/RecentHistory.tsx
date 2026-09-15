import React from 'react';
import { History, Trash2, ArrowUpRight } from 'lucide-react';
import { QrHistoryItem } from '../types';

interface RecentHistoryProps {
  items: QrHistoryItem[];
  onSelect: (item: QrHistoryItem) => void;
  onClear: () => void;
}

export const RecentHistory: React.FC<RecentHistoryProps> = ({ items, onSelect, onClear }) => {
  if (items.length === 0) return null;

  return (
    <div id="recent-history-tray" className="pt-6 border-t border-white/5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <History className="w-3.5 h-3.5 text-cyan-400" />
          <span>Recent QR Codes</span>
        </div>
        <button
          id="clear-history-button"
          type="button"
          onClick={onClear}
          className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
          title="Clear history"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear</span>
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
        {items.map((item) => (
          <button
            key={item.id}
            id={`history-item-${item.id}`}
            type="button"
            onClick={() => onSelect(item)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 border border-white/5 hover:border-cyan-500/30 text-left transition-all shrink-0 group"
          >
            <div
              className="w-3 h-3 rounded-full border border-white/10 shrink-0"
              style={{ backgroundColor: item.fgColor }}
            />
            <span className="text-xs text-slate-300 group-hover:text-cyan-200 truncate max-w-[150px]">
              {item.url.replace(/^https?:\/\//, '')}
            </span>
            <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};
