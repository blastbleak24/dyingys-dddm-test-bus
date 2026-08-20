import React from 'react';
import { LTANextBus } from '../types';
import { getArrivalDisplay, getLoadBadge, getBusTypeLabel } from '../utils/busUtils';
import { Accessibility, Layers, Clock } from 'lucide-react';

interface BusArrivalPillProps {
  bus?: LTANextBus;
  slotName: string;
  isPrimary?: boolean;
}

export const BusArrivalPill: React.FC<BusArrivalPillProps> = ({
  bus,
  slotName,
  isPrimary = false,
}) => {
  if (!bus || !bus.EstimatedArrival) {
    return (
      <div
        id={`arrival-slot-empty-${slotName.toLowerCase().replace(/\s+/g, '-')}`}
        className="flex-1 rounded-xl bg-[#0F1626]/70 border border-slate-800/80 p-3.5 flex flex-col items-center justify-center min-h-[115px] text-center"
      >
        <span className="text-[10px] font-mono font-medium text-slate-500 uppercase tracking-widest mb-1">
          {slotName}
        </span>
        <span className="text-xs text-slate-500 font-medium">
          No active bus
        </span>
        <div className="h-1 w-full bg-slate-800/80 rounded mt-3" />
      </div>
    );
  }

  const arrival = getArrivalDisplay(bus.EstimatedArrival);
  const load = getLoadBadge(bus.Load);
  const busType = getBusTypeLabel(bus.Type);
  const isWAB = bus.Feature === 'WAB';

  return (
    <div
      id={`arrival-slot-${slotName.toLowerCase().replace(/\s+/g, '-')}`}
      className={`flex-1 rounded-xl p-3.5 flex flex-col justify-between min-h-[115px] transition-all border ${
        isPrimary
          ? 'bg-[#0F1626] border-slate-700/80 shadow-md'
          : 'bg-[#0F1626]/60 border-slate-800/90'
      }`}
    >
      {/* Header: Slot Name + Time + WAB */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span className="uppercase tracking-wider font-semibold text-slate-400">
          {slotName}
        </span>
        <div className="flex items-center gap-1.5">
          {isWAB && (
            <span
              className="text-sky-400"
              title="Wheelchair Accessible"
            >
              <Accessibility className="w-3 h-3" />
            </span>
          )}
          <span className="text-slate-400 font-mono">
            {arrival.timeStr}
          </span>
        </div>
      </div>

      {/* Main Timing: Big Bold Countdown */}
      <div className="text-center my-1">
        {arrival.isArriving ? (
          <p className="text-3xl sm:text-4xl font-bold text-emerald-400 leading-tight tracking-tight animate-pulse">
            ARR
          </p>
        ) : arrival.isDeparted ? (
          <p className="text-2xl sm:text-3xl font-bold text-slate-500 leading-tight">
            LEFT
          </p>
        ) : (
          <p className={`text-3xl sm:text-4xl font-bold tracking-tight ${load.textColor}`}>
            {arrival.minutes !== null ? arrival.minutes : arrival.label}
            <span className="text-base sm:text-lg font-normal text-slate-400 ml-0.5">m</span>
          </p>
        )}
        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter font-semibold">
          {load.shortLabel}
        </p>

        {/* Micro Load Progress Bar */}
        <div className={`h-1 w-full ${load.barBg} rounded mt-1.5 overflow-hidden`}>
          <div
            className={`h-full ${load.barFill} transition-all duration-500`}
            style={{ width: load.barWidth }}
          />
        </div>
      </div>

      {/* Bottom info: Deck type & Load code pill */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
        <span className="text-slate-400 font-mono uppercase">
          {busType.code}
        </span>
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded font-mono font-semibold ${load.bg}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${load.dot}`} />
          {load.code}
        </span>
      </div>
    </div>
  );
};
