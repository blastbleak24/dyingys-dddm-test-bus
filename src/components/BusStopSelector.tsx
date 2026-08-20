import React, { useState } from 'react';
import { BusStopInfo } from '../types';
import { POPULAR_BUS_STOPS } from '../data/busStops';
import { Search, Star, History, Compass, ArrowRight } from 'lucide-react';

interface BusStopSelectorProps {
  currentCode: string;
  onSelectStop: (code: string) => void;
  favorites: string[];
  recentStops: string[];
}

export const BusStopSelector: React.FC<BusStopSelectorProps> = ({
  currentCode,
  onSelectStop,
  favorites,
  recentStops,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [activeTab, setActiveTab] = useState<'curated' | 'favorites' | 'history'>('curated');

  const filteredStops = POPULAR_BUS_STOPS.filter(
    (stop) =>
      stop.code.includes(searchInput.trim()) ||
      stop.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      stop.road.toLowerCase().includes(searchInput.toLowerCase()) ||
      stop.services?.some((s) => s.toLowerCase() === searchInput.trim().toLowerCase())
  );

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualCodeInput.trim();
    if (clean.length > 0) {
      const padded = clean.padStart(5, '0');
      onSelectStop(padded);
      setManualCodeInput('');
    }
  };

  return (
    <div
      id="bus-stop-selector"
      className="bg-[#161D2F] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl"
    >
      {/* Top Search & Manual Code Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
        {/* Direct 5-Digit Code Input */}
        <form
          onSubmit={handleManualSubmit}
          className="md:col-span-5 flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              id="input-manual-bus-stop"
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={5}
              value={manualCodeInput}
              onChange={(e) => setManualCodeInput(e.target.value.replace(/\D/g, ''))}
              placeholder="5-digit code (e.g. 83139)"
              className="w-full pl-3.5 pr-3 py-2 text-sm bg-[#0F1626] border border-slate-800 focus:border-sky-500 rounded-xl focus:outline-none font-mono text-slate-100 placeholder:text-slate-500"
            />
          </div>
          <button
            id="btn-submit-stop-code"
            type="submit"
            disabled={!manualCodeInput.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-[#0A0F1E] text-xs font-bold font-mono uppercase tracking-wider shadow-md disabled:opacity-40 transition-colors whitespace-nowrap"
          >
            <span>LOAD</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Search by Name / Road */}
        <div className="md:col-span-7 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-stops"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search stop name, road, or bus service (e.g. Eunos, Orchard, 15)..."
            className="w-full pl-9 pr-3.5 py-2 text-sm bg-[#0F1626] border border-slate-800 focus:border-sky-500 rounded-xl focus:outline-none text-slate-100 placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-3 text-xs font-mono">
        <button
          type="button"
          onClick={() => setActiveTab('curated')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'curated'
              ? 'bg-[#0F1626] text-sky-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-sky-400" />
          <span>POPULAR STOPS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('favorites')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'favorites'
              ? 'bg-[#0F1626] text-amber-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span>SAVED ({favorites.length})</span>
        </button>

        {recentStops.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'history'
                ? 'bg-[#0F1626] text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5 text-emerald-400" />
            <span>RECENT</span>
          </button>
        )}
      </div>

      {/* Stop Cards / Chips Container */}
      <div className="max-h-48 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
        {activeTab === 'curated' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredStops.length === 0 ? (
              <div className="col-span-full py-4 text-center text-xs text-slate-500 font-mono">
                No matching stops. Enter any 5-digit code above.
              </div>
            ) : (
              filteredStops.map((stop) => {
                const isSelected = stop.code === currentCode;
                return (
                  <button
                    id={`btn-select-stop-${stop.code}`}
                    key={stop.code}
                    type="button"
                    onClick={() => onSelectStop(stop.code)}
                    className={`flex items-start justify-between p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#0F1626] border-sky-500 ring-1 ring-sky-500/30'
                        : 'bg-[#0F1626]/60 hover:bg-[#0F1626] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/15 px-1.5 py-0.2 rounded border border-sky-500/30">
                          {stop.code}
                        </span>
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {stop.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate font-mono">
                        {stop.road}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0 mt-1 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {favorites.length === 0 ? (
              <div className="col-span-full py-4 text-center text-xs text-slate-500 font-mono">
                No saved stops yet. Click SAVE STOP to bookmark.
              </div>
            ) : (
              favorites.map((code) => {
                const stop = POPULAR_BUS_STOPS.find((s) => s.code === code) || {
                  code,
                  name: `Bus Stop ${code}`,
                  road: 'Singapore Road Network',
                };
                const isSelected = stop.code === currentCode;
                return (
                  <button
                    id={`btn-fav-stop-${stop.code}`}
                    key={stop.code}
                    type="button"
                    onClick={() => onSelectStop(stop.code)}
                    className={`flex items-start justify-between p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#0F1626] border-amber-500 ring-1 ring-amber-500/30'
                        : 'bg-[#0F1626]/60 hover:bg-[#0F1626] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/15 px-1.5 py-0.2 rounded border border-amber-500/30">
                          {stop.code}
                        </span>
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {stop.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate font-mono">
                        {stop.road}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="flex flex-wrap gap-2 py-1">
            {recentStops.map((code) => {
              const stop = POPULAR_BUS_STOPS.find((s) => s.code === code);
              return (
                <button
                  id={`btn-recent-stop-${code}`}
                  key={code}
                  type="button"
                  onClick={() => onSelectStop(code)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-colors border ${
                    code === currentCode
                      ? 'bg-sky-500 text-[#0A0F1E] border-sky-500'
                      : 'bg-[#0F1626] text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{code}</span>
                  {stop && <span className="opacity-75 font-sans font-normal">({stop.name})</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
