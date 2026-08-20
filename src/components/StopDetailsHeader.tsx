import React, { useState } from 'react';
import { BusStopInfo } from '../types';
import { Star, MapPin, Check, Copy } from 'lucide-react';

interface StopDetailsHeaderProps {
  stopInfo: BusStopInfo;
  serviceCount: number;
  isFavorite: boolean;
  onToggleFavorite: (code: string) => void;
}

export const StopDetailsHeader: React.FC<StopDetailsHeaderProps> = ({
  stopInfo,
  serviceCount,
  isFavorite,
  onToggleFavorite,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(stopInfo.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div
      id="stop-details-header"
      className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800"
    >
      <div>
        <div className="flex items-center gap-3 flex-wrap mb-1">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {stopInfo.name}
          </h1>
          {stopInfo.region && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-sky-400 border border-slate-700 font-mono">
              {stopInfo.region}
            </span>
          )}
        </div>
        <p className="text-slate-400 font-mono text-xs sm:text-sm tracking-widest uppercase flex items-center gap-2 flex-wrap">
          <span>BUS STOP CODE: <strong className="text-white font-mono">{stopInfo.code}</strong></span>
          <span>•</span>
          <span className="text-slate-300">{stopInfo.road}</span>
          <span>•</span>
          <span className="text-emerald-400 font-mono font-semibold">{serviceCount} ACTIVE {serviceCount === 1 ? 'SERVICE' : 'SERVICES'}</span>
        </p>
      </div>

      {/* Action Buttons: Copy code & Save favorite */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          id="btn-copy-stop-code"
          type="button"
          onClick={handleCopyCode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-medium text-slate-300 border border-slate-700 transition-colors"
          title="Copy 5-digit bus stop code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">COPIED</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>COPY CODE</span>
            </>
          )}
        </button>

        <button
          id="btn-toggle-favorite"
          type="button"
          onClick={() => onToggleFavorite(stopInfo.code)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
            isFavorite
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
          title={isFavorite ? 'Remove from saved favorites' : 'Save bus stop to favorites'}
        >
          <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current text-amber-400' : 'text-slate-400'}`} />
          <span>{isFavorite ? 'SAVED' : 'SAVE STOP'}</span>
        </button>
      </div>
    </div>
  );
};
