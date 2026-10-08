import React from 'react';
import { Database, AlertTriangle } from 'lucide-react';

interface StorageProgressProps {
  usedBytes: number;
  limitBytes: number;
  showBreakdown?: boolean;
  breakdown?: {
    jpeg?: number;
    png?: number;
    webp?: number;
    gif?: number;
    other?: number;
  };
  compact?: boolean;
}

export const StorageProgress: React.FC<StorageProgressProps> = ({
  usedBytes,
  limitBytes,
  showBreakdown = false,
  breakdown,
  compact = false,
}) => {
  const usedMB = (usedBytes / (1024 * 1024)).toFixed(1);
  const limitNumMB = Math.round(limitBytes / (1024 * 1024));
  const limitMB = limitNumMB.toString();
  const percentage = Math.min(100, Math.max(0, (usedBytes / (limitBytes || 1)) * 100));

  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 98;

  const barColor = isAtLimit
    ? 'bg-rose-500'
    : isNearLimit
    ? 'bg-amber-500'
    : 'bg-blue-600 dark:bg-blue-500';

  if (compact) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
          <span className="text-slate-600 dark:text-slate-400">
            {usedMB} MB of {limitMB} MB
          </span>
          <span className={isNearLimit ? 'text-amber-500 font-bold' : 'text-slate-500 dark:text-slate-400'}>
            {percentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      id="storage-progress-card"
      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Storage Usage
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {limitNumMB >= 1024 ? `${(limitNumMB / 1024).toFixed(0)} GB Cloud Storage` : `${limitNumMB} MB Cloud Storage`}
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            isAtLimit
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
              : isNearLimit
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {percentage.toFixed(1)}% Used
        </span>
      </div>

      <div className="flex items-baseline justify-between text-sm mb-2">
        <span className="font-bold text-slate-900 dark:text-white">
          {usedMB} MB
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Limit: {limitMB} MB
        </span>
      </div>

      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {isNearLimit && (
        <div className="flex items-center gap-2 mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Approaching free limit. Delete unused images to free up space.</span>
        </div>
      )}

      {showBreakdown && breakdown && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">JPEG/JPG</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {((breakdown.jpeg || 0) / 1024 / 1024).toFixed(1)} MB
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">PNG</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {((breakdown.png || 0) / 1024 / 1024).toFixed(1)} MB
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">WebP</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {((breakdown.webp || 0) / 1024 / 1024).toFixed(1)} MB
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">GIF & Other</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {(((breakdown.gif || 0) + (breakdown.other || 0)) / 1024 / 1024).toFixed(1)} MB
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
