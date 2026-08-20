import React from 'react';
import { Filter, ArrowUpDown, Clock, Users } from 'lucide-react';

export type SortOption = 'earliest' | 'service-asc' | 'service-desc';
export type LoadFilterOption = 'all' | 'SEA' | 'SDA' | 'LSD';

interface BusFilterBarProps {
  serviceSearch: string;
  onServiceSearchChange: (val: string) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  loadFilter: LoadFilterOption;
  onLoadFilterChange: (option: LoadFilterOption) => void;
  arrivingOnly: boolean;
  onToggleArrivingOnly: () => void;
  totalServices: number;
  filteredCount: number;
}

export const BusFilterBar: React.FC<BusFilterBarProps> = ({
  serviceSearch,
  onServiceSearchChange,
  sortOption,
  onSortChange,
  loadFilter,
  onLoadFilterChange,
  arrivingOnly,
  onToggleArrivingOnly,
  totalServices,
  filteredCount,
}) => {
  return (
    <div
      id="bus-filter-bar"
      className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#161D2F] border border-slate-800 text-xs shadow-lg"
    >
      {/* Left: Filter by Service Number */}
      <div className="flex items-center gap-2 flex-1">
        <div className="relative flex-1 max-w-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-filter-service-no"
            type="text"
            value={serviceSearch}
            onChange={(e) => onServiceSearchChange(e.target.value)}
            placeholder="Filter bus # (e.g. 15, 24)..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#0F1626] border border-slate-800 focus:border-sky-500 text-slate-200 focus:outline-none font-mono"
          />
        </div>

        {/* Arriving soon filter toggle */}
        <button
          id="btn-filter-arriving-soon"
          type="button"
          onClick={onToggleArrivingOnly}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono uppercase tracking-wider font-semibold transition-colors ${
            arrivingOnly
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
              : 'bg-[#0F1626] text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>&le; 5 MIN</span>
        </button>
      </div>

      {/* Right: Load Filter & Sort Options */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap font-mono">
        {/* Load Filter */}
        <div className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5 text-slate-500" />
          <select
            id="select-load-filter"
            value={loadFilter}
            onChange={(e) => onLoadFilterChange(e.target.value as LoadFilterOption)}
            className="px-2.5 py-1.5 rounded-xl bg-[#0F1626] border border-slate-800 text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="all">ALL LOADS</option>
            <option value="SEA">SEATS AVAIL (SEA)</option>
            <option value="SDA">STANDING (SDA)</option>
            <option value="LSD">CROWDED (LSD)</option>
          </select>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
          <select
            id="select-sort-option"
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="px-2.5 py-1.5 rounded-xl bg-[#0F1626] border border-slate-800 text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="earliest">SOONEST ARRIVAL</option>
            <option value="service-asc">BUS # ASC</option>
            <option value="service-desc">BUS # DESC</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-mono font-bold px-2 py-1 bg-[#0F1626] rounded-lg border border-slate-800">
          {filteredCount}/{totalServices}
        </span>
      </div>
    </div>
  );
};
