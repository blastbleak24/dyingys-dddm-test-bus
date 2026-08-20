import React, { useState, useEffect, useCallback } from 'react';
import { LTABusArrivalResponse } from './types';
import { getBusStopDetails } from './data/busStops';
import { getArrivalDisplay } from './utils/busUtils';
import { generateEstimatedArrivals } from './utils/mockArrivals';
import { BusCard } from './components/BusCard';
import { RefreshControl } from './components/RefreshControl';
import { BusStopSelector } from './components/BusStopSelector';
import { StopDetailsHeader } from './components/StopDetailsHeader';
import { BusFilterBar, SortOption, LoadFilterOption } from './components/BusFilterBar';
import {
  Bus,
  AlertCircle,
  Info,
  ShieldCheck,
  RefreshCw,
  Radio,
} from 'lucide-react';

const REFRESH_INTERVAL_SECONDS = 20;
const LTA_DIRECT_KEY = 'aJ/kjdfiQMyuFDRzw2Ju5g==';

export default function App() {
  const [busStopCode, setBusStopCode] = useState<string>('83139');
  const [data, setData] = useState<LTABusArrivalResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEstimatedFallback, setIsEstimatedFallback] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Auto-refresh timer
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(true);
  const [secondsLeft, setSecondsLeft] = useState<number>(REFRESH_INTERVAL_SECONDS);

  // Filters & sorting
  const [serviceSearch, setServiceSearch] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('earliest');
  const [loadFilter, setLoadFilter] = useState<LoadFilterOption>('all');
  const [arrivingOnly, setArrivingOnly] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(false);

  // LocalStorage state
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sg_bus_favorites');
      return saved ? JSON.parse(saved) : ['83139', '03211', '75009'];
    } catch {
      return ['83139', '03211', '75009'];
    }
  });

  const [recentStops, setRecentStops] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sg_bus_recent');
      return saved ? JSON.parse(saved) : ['83139'];
    } catch {
      return ['83139'];
    }
  });

  const [pinnedServices, setPinnedServices] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sg_bus_pinned');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sg_bus_favorites', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  // Save recentStops to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sg_bus_recent', JSON.stringify(recentStops));
    } catch {
      // ignore
    }
  }, [recentStops]);

  // Save pinned services to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sg_bus_pinned', JSON.stringify(pinnedServices));
    } catch {
      // ignore
    }
  }, [pinnedServices]);

  // Robust Multi-Tier Fetching for Singapore Bus Arrival Data
  const fetchArrivals = useCallback(async (code: string, isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    setError(null);

    const paddedCode = code.trim().padStart(5, '0');

    // Tier 1: Try internal server API endpoint
    try {
      const response = await fetch(`/api/bus-arrival?busStopCode=${encodeURIComponent(paddedCode)}`);
      if (response.ok) {
        const result: LTABusArrivalResponse = await response.json();
        if (result && Array.isArray(result.Services)) {
          setData(result);
          setIsEstimatedFallback(false);
          setLastUpdated(new Date());
          setError(null);
          setRecentStops((prev) => [paddedCode, ...prev.filter((c) => c !== paddedCode)].slice(0, 8));
          setIsLoading(false);
          setSecondsLeft(REFRESH_INTERVAL_SECONDS);
          return;
        }
      }
    } catch (err1) {
      console.warn('[Tier 1 Proxy Fetch failed, trying direct LTA fallback]:', err1);
    }

    // Tier 2: Try direct LTA DataMall v3 API endpoint from browser client
    try {
      const directUrl = `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${encodeURIComponent(paddedCode)}`;
      const directRes = await fetch(directUrl, {
        headers: {
          AccountKey: LTA_DIRECT_KEY,
          accept: 'application/json',
        },
      });

      if (directRes.ok) {
        const directData: LTABusArrivalResponse = await directRes.json();
        if (directData && Array.isArray(directData.Services)) {
          setData(directData);
          setIsEstimatedFallback(false);
          setLastUpdated(new Date());
          setError(null);
          setRecentStops((prev) => [paddedCode, ...prev.filter((c) => c !== paddedCode)].slice(0, 8));
          setIsLoading(false);
          setSecondsLeft(REFRESH_INTERVAL_SECONDS);
          return;
        }
      }
    } catch (err2) {
      console.warn('[Tier 2 Direct LTA Fetch failed, engaging estimated fallback]:', err2);
    }

    // Tier 3: Seamless Estimated Fallback (ensures UI is always responsive & never broken)
    try {
      const fallbackData = generateEstimatedArrivals(paddedCode);
      setData(fallbackData);
      setIsEstimatedFallback(true);
      setLastUpdated(new Date());
      setRecentStops((prev) => [paddedCode, ...prev.filter((c) => c !== paddedCode)].slice(0, 8));
    } catch (err3) {
      console.error('All fetch tiers failed:', err3);
      setError('Unable to load bus arrival predictions. Please try again.');
    } finally {
      setIsLoading(false);
      setSecondsLeft(REFRESH_INTERVAL_SECONDS);
    }
  }, []);

  // Fetch when stop code changes
  useEffect(() => {
    fetchArrivals(busStopCode);
  }, [busStopCode, fetchArrivals]);

  // 20-Second auto-refresh ticker
  useEffect(() => {
    if (!isAutoRefresh) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          fetchArrivals(busStopCode, true);
          return REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoRefresh, busStopCode, fetchArrivals]);

  const handleSelectStop = (newCode: string) => {
    const cleaned = newCode.trim().padStart(5, '0');
    setBusStopCode(cleaned);
    setSecondsLeft(REFRESH_INTERVAL_SECONDS);
  };

  const handleToggleFavorite = (code: string) => {
    setFavorites((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleTogglePinService = (serviceNo: string) => {
    setPinnedServices((prev) =>
      prev.includes(serviceNo)
        ? prev.filter((s) => s !== serviceNo)
        : [...prev, serviceNo]
    );
  };

  const currentStopInfo = getBusStopDetails(busStopCode);
  const isCurrentFavorite = favorites.includes(busStopCode);

  // Filter and sort the services
  const allServices = data?.Services || [];

  const filteredServices = allServices.filter((s) => {
    // Service number search filter
    if (serviceSearch.trim()) {
      const match = s.ServiceNo.toLowerCase().includes(serviceSearch.trim().toLowerCase());
      if (!match) return false;
    }

    // Load filter
    if (loadFilter !== 'all') {
      const nextLoad = s.NextBus?.Load;
      if (nextLoad !== loadFilter) return false;
    }

    // Arriving only filter (arrival within 5 minutes)
    if (arrivingOnly) {
      if (!s.NextBus?.EstimatedArrival) return false;
      const arr = getArrivalDisplay(s.NextBus.EstimatedArrival);
      if (arr.minutes === null || arr.minutes > 5) return false;
    }

    return true;
  });

  // Sort services: pinned first, then by selected sort option
  const sortedServices = [...filteredServices].sort((a, b) => {
    const isAPinned = pinnedServices.includes(a.ServiceNo);
    const isBPinned = pinnedServices.includes(b.ServiceNo);
    if (isAPinned && !isBPinned) return -1;
    if (!isAPinned && isBPinned) return 1;

    if (sortOption === 'earliest') {
      const minA = a.NextBus?.EstimatedArrival
        ? new Date(a.NextBus.EstimatedArrival).getTime()
        : Infinity;
      const minB = b.NextBus?.EstimatedArrival
        ? new Date(b.NextBus.EstimatedArrival).getTime()
        : Infinity;
      return minA - minB;
    }

    if (sortOption === 'service-asc') {
      return a.ServiceNo.localeCompare(b.ServiceNo, undefined, { numeric: true });
    }

    if (sortOption === 'service-desc') {
      return b.ServiceNo.localeCompare(a.ServiceNo, undefined, { numeric: true });
    }

    return 0;
  });

  return (
    <div
      id="sg-nextbus-app"
      className="min-h-screen bg-[#0A0F1E] text-slate-200 font-sans flex flex-col antialiased selection:bg-sky-500 selection:text-[#0A0F1E]"
    >
      {/* Top Sleek Header */}
      <header
        id="app-header"
        className="sticky top-0 z-30 bg-[#0A0F1E]/95 backdrop-blur-md border-b border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-sky-500 text-[#0A0F1E] font-black text-2xl px-3 py-1 rounded-lg font-mono tracking-tight shadow-md flex items-center gap-1.5">
              <Bus className="w-5 h-5 stroke-[2.5]" />
              <span>SG NEXTBUS</span>
            </span>

            <div className="hidden sm:flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border uppercase tracking-wider flex items-center gap-1.5 ${
                isEstimatedFallback
                  ? 'bg-amber-950/40 text-amber-400 border-amber-800/60'
                  : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isEstimatedFallback ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                }`} />
                {isEstimatedFallback ? 'Estimated Fallback Mode' : 'LTA DataMall v3 Live'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-toggle-legend"
              type="button"
              onClick={() => setShowLegend(!showLegend)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-[#161D2F] text-xs font-mono font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-colors uppercase tracking-wider"
              title="Show LTA specifications guide"
            >
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span>SPEC GUIDE</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* LTA Indicator Legend Modal/Drawer */}
        {showLegend && (
          <div
            id="lta-legend-card"
            className="p-5 rounded-2xl bg-[#161D2F] border border-slate-800 shadow-2xl text-xs space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                Singapore LTA DataMall v3 Specifications
              </h3>
              <button
                type="button"
                onClick={() => setShowLegend(false)}
                className="text-slate-400 hover:text-white font-mono text-xs uppercase"
              >
                CLOSE [X]
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 font-mono">
              <div>
                <p className="font-bold text-slate-200 uppercase tracking-wider mb-2">
                  Load Indicators
                </p>
                <div className="space-y-2 text-[11px]">
                  <p className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <span className="font-bold text-emerald-400">SEA</span>
                    <span className="text-slate-400">: Seats Available</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                    <span className="font-bold text-amber-400">SDA</span>
                    <span className="text-slate-400">: Standing Available</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                    <span className="font-bold text-red-500">LSD</span>
                    <span className="text-slate-400">: Limited Standing (Full)</span>
                  </p>
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-200 uppercase tracking-wider mb-2">
                  Vehicle Type
                </p>
                <div className="space-y-1.5 text-[11px] text-slate-400">
                  <p>
                    <strong className="text-white">SD</strong>: Single Deck Bus
                  </p>
                  <p>
                    <strong className="text-white">DD</strong>: Double Deck Bus
                  </p>
                  <p>
                    <strong className="text-white">BD</strong>: Bendy Articulated Bus
                  </p>
                  <p>
                    <strong className="text-sky-400">WAB</strong>: Wheelchair Accessible Bus
                  </p>
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-200 uppercase tracking-wider mb-2">
                  Sync Policy
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
                  The LTA DataMall predictions calculate live traffic and road speeds. A continuous 20-second cadence ensures maximum arrival accuracy without rate limits.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bus Stop Selector */}
        <BusStopSelector
          currentCode={busStopCode}
          onSelectStop={handleSelectStop}
          favorites={favorites}
          recentStops={recentStops}
        />

        {/* Stop Header - Sleek large display */}
        <StopDetailsHeader
          stopInfo={currentStopInfo}
          serviceCount={allServices.length}
          isFavorite={isCurrentFavorite}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* Refresh Control & Live Countdown Banner */}
        <RefreshControl
          secondsLeft={secondsLeft}
          totalInterval={REFRESH_INTERVAL_SECONDS}
          isAutoRefresh={isAutoRefresh}
          onToggleAutoRefresh={() => setIsAutoRefresh(!isAutoRefresh)}
          onRefreshNow={() => fetchArrivals(busStopCode)}
          isLoading={isLoading}
          lastUpdated={lastUpdated}
        />

        {/* Filter & Sort Bar */}
        {allServices.length > 0 && (
          <BusFilterBar
            serviceSearch={serviceSearch}
            onServiceSearchChange={setServiceSearch}
            sortOption={sortOption}
            onSortChange={setSortOption}
            loadFilter={loadFilter}
            onLoadFilterChange={setLoadFilter}
            arrivingOnly={arrivingOnly}
            onToggleArrivingOnly={() => setArrivingOnly(!arrivingOnly)}
            totalServices={allServices.length}
            filteredCount={sortedServices.length}
          />
        )}

        {/* Error Notification */}
        {error && (
          <div
            id="error-banner"
            className="p-4 rounded-2xl bg-red-950/40 border border-red-800/80 text-red-200 flex items-start gap-3 text-sm shadow-xl"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold font-mono uppercase mb-0.5">Notice</h4>
              <p className="text-xs text-red-300 mb-3 font-sans">
                {error}
              </p>
              <button
                type="button"
                onClick={() => fetchArrivals(busStopCode)}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white font-mono font-bold text-xs hover:bg-red-500 transition-colors inline-flex items-center gap-1.5 uppercase"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Feed
              </button>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && !data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-[#161D2F] rounded-2xl p-6 border border-slate-800 shadow-2xl animate-pulse space-y-6"
              >
                <div className="flex justify-between items-center">
                  <div className="w-20 h-12 bg-slate-800 rounded-lg" />
                  <div className="w-32 h-6 bg-slate-800 rounded" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-24 bg-slate-800/80 rounded-xl" />
                  <div className="h-24 bg-slate-800/80 rounded-xl" />
                  <div className="h-24 bg-slate-800/80 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bus Service Cards Grid (Matching 2-column Sleek layout) */}
        {!isLoading || data ? (
          sortedServices.length === 0 ? (
            <div
              id="empty-services-view"
              className="py-16 px-4 text-center rounded-2xl bg-[#161D2F] border border-slate-800 shadow-2xl"
            >
              <Bus className="w-14 h-14 mx-auto text-slate-600 mb-3" />
              <h3 className="text-lg font-bold text-white mb-1 font-mono uppercase">
                {allServices.length === 0
                  ? 'No bus services operating at this stop'
                  : 'No buses match your filter criteria'}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
                {allServices.length === 0
                  ? `Bus stop code ${busStopCode} returned 0 active scheduled bus arrivals from LTA DataMall.`
                  : 'Adjust your search query or reset load and arrival thresholds.'}
              </p>
              {serviceSearch || loadFilter !== 'all' || arrivingOnly ? (
                <button
                  type="button"
                  onClick={() => {
                    setServiceSearch('');
                    setLoadFilter('all');
                    setArrivingOnly(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-slate-200 transition-colors uppercase tracking-wider"
                >
                  Reset Filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSelectStop('83139')}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-[#0A0F1E] text-xs font-mono font-bold uppercase tracking-wider shadow-md transition-colors"
                >
                  Switch to Eunos Int (83139)
                </button>
              )}
            </div>
          ) : (
            <div
              id="bus-services-grid"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {sortedServices.map((service) => (
                <BusCard
                  key={service.ServiceNo}
                  service={service}
                  isPinned={pinnedServices.includes(service.ServiceNo)}
                  onTogglePin={handleTogglePinService}
                />
              ))}
            </div>
          )
        ) : null}

        {/* Sleek Interface Footer with Live Legend & API metadata */}
        <footer
          id="app-footer"
          className="flex flex-wrap items-center gap-6 sm:gap-10 mt-8 pt-6 pb-6 border-t border-slate-800 text-slate-400"
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-xs text-slate-400 uppercase tracking-widest font-mono font-semibold">
              Seats Available
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            <span className="text-xs text-slate-400 uppercase tracking-widest font-mono font-semibold">
              Standing Available
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
            <span className="text-xs text-slate-400 uppercase tracking-widest font-mono font-semibold">
              Limited Standing
            </span>
          </div>
          <div className="ml-auto flex items-center gap-4 text-slate-500 text-[10px] uppercase font-mono tracking-widest">
            <span className="bg-slate-800 px-2.5 py-1 rounded text-slate-300 border border-slate-700 font-bold">
              v3 API
            </span>
            <span>ACC: aJ/kj...Ju5g==</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
