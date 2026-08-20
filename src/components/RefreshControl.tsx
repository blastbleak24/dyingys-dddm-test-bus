import React from 'react';
import { RotateCw, Pause, Play, Clock } from 'lucide-react';

interface RefreshControlProps {
  secondsLeft: number;
  totalInterval?: number;
  isAutoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  onRefreshNow: () => void;
  isLoading: boolean;
  lastUpdated: Date | null;
}

export const RefreshControl: React.FC<RefreshControlProps> = ({
  secondsLeft,
  totalInterval = 20,
  isAutoRefresh,
  onToggleAutoRefresh,
  onRefreshNow,
  isLoading,
  lastUpdated,
}) => {
  const radius = 11;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.max(0, Math.min(1, secondsLeft / totalInterval));
  const strokeDashoffset = circumference - progressRatio * circumference;

  const formattedLastUpdated = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    : '--:--:--';

  return (
    <div
      id="refresh-control-panel"
      className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#161D2F] border border-slate-800 text-slate-200 shadow-lg"
    >
      {/* Left: Sleek Live Feed Status indicator */}
      <div className="flex items-center gap-4 text-xs">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 mb-0.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">
              Live Feed Active
            </span>
          </div>
          <p className="text-slate-400 text-xs font-mono tracking-wider uppercase">
            {isAutoRefresh ? `REFRESHING IN ${secondsLeft}s` : 'REFRESH PAUSED'}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-slate-400 font-mono text-xs border-l border-slate-800 pl-4">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>SYNC:</span>
          <span className="text-slate-200 font-medium">
            {formattedLastUpdated} SGT
          </span>
        </div>
      </div>

      {/* Right: Timer ring, Pause/Resume, and Instant Refresh Button */}
      <div className="flex items-center gap-2.5">
        {/* Circular Progress Ring */}
        <div
          id="refresh-timer-badge"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0F1626] border border-slate-800 font-mono"
          title={`20s interval countdown`}
        >
          {isAutoRefresh ? (
            <div className="relative w-5 h-5 flex items-center justify-center">
              <svg className="w-5 h-5 -rotate-90 transform" viewBox="0 0 26 26">
                <circle
                  cx="13"
                  cy="13"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-slate-800 fill-none"
                />
                <circle
                  cx="13"
                  cy="13"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="text-emerald-400 transition-all duration-300 ease-linear fill-none"
                />
              </svg>
              <span className="absolute font-mono text-[9px] font-bold text-white">
                {secondsLeft}
              </span>
            </div>
          ) : (
            <span className="text-xs font-semibold text-amber-400 font-mono">
              PAUSED
            </span>
          )}

          <span className="text-xs text-slate-300 font-semibold font-mono">
            {secondsLeft}s
          </span>
        </div>

        {/* Toggle Auto-refresh */}
        <button
          id="btn-toggle-auto-refresh"
          type="button"
          onClick={onToggleAutoRefresh}
          className="p-2 rounded-lg border border-slate-800 bg-[#0F1626] text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          title={isAutoRefresh ? 'Pause 20s auto-refresh' : 'Resume 20s auto-refresh'}
          aria-label={isAutoRefresh ? 'Pause auto-refresh' : 'Resume auto-refresh'}
        >
          {isAutoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Refresh Now Button */}
        <button
          id="btn-refresh-now"
          type="button"
          onClick={onRefreshNow}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-[#0A0F1E] text-xs font-bold shadow-md transition-colors disabled:opacity-50 font-mono uppercase tracking-wider"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
};
