import React, { useState } from 'react';
import { LTABusService } from '../types';
import { BusArrivalPill } from './BusArrivalPill';
import { getOperatorDetails, getBusTypeLabel } from '../utils/busUtils';
import { getBusStopDetails } from '../data/busStops';
import { ChevronDown, ChevronUp, MapPin, Pin, Bus } from 'lucide-react';

interface BusCardProps {
  service: LTABusService;
  isPinned?: boolean;
  onTogglePin?: (serviceNo: string) => void;
}

export const BusCard: React.FC<BusCardProps> = ({
  service,
  isPinned = false,
  onTogglePin,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const op = getOperatorDetails(service.Operator);
  const busType = getBusTypeLabel(service.NextBus?.Type);

  const destinationStop = service.NextBus?.DestinationCode
    ? getBusStopDetails(service.NextBus.DestinationCode)
    : null;

  return (
    <div
      id={`bus-card-${service.ServiceNo}`}
      className={`bg-[#161D2F] rounded-2xl p-5 sm:p-6 border shadow-2xl flex flex-col justify-between transition-all ${
        isPinned
          ? 'border-sky-500/60 ring-1 ring-sky-500/30'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Header section with Service Badge, Destination, Deck tag and Actions */}
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-center gap-3">
          {/* Service number badge from design theme: bg-sky-500 text-[#0A0F1E] */}
          <span
            id={`service-badge-${service.ServiceNo}`}
            className="bg-sky-500 text-[#0A0F1E] font-black text-3xl sm:text-4xl px-4 py-2 rounded-lg font-mono tracking-tight shadow-md flex items-center justify-center min-w-[68px]"
          >
            {service.ServiceNo}
          </span>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {op.name}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Op: {service.Operator || 'SG Bus'}
            </span>
          </div>
        </div>

        {/* Right side: Destination label, Deck type badge, Pin & Expand buttons */}
        <div className="flex flex-col items-end gap-1.5 text-right">
          <div className="flex items-center gap-1.5">
            {destinationStop ? (
              <span className="text-xs text-slate-300 block uppercase font-bold tracking-tight truncate max-w-[160px] sm:max-w-[220px]">
                To {destinationStop.name}
              </span>
            ) : (
              <span className="text-xs text-slate-400 block uppercase font-bold tracking-tight">
                SG Public Bus
              </span>
            )}

            {onTogglePin && (
              <button
                id={`btn-pin-service-${service.ServiceNo}`}
                type="button"
                onClick={() => onTogglePin(service.ServiceNo)}
                className={`p-1 rounded-md text-xs transition-colors ${
                  isPinned
                    ? 'text-sky-400 bg-sky-500/20'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                }`}
                title={isPinned ? 'Unpin service' : 'Pin service to top'}
                aria-label={`Pin bus ${service.ServiceNo}`}
              >
                <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 bg-slate-800 text-[10px] font-semibold font-mono text-slate-300 rounded border border-slate-700 uppercase tracking-wider">
              {busType.name.toUpperCase()}
            </span>

            <button
              id={`btn-expand-${service.ServiceNo}`}
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
              title="Toggle GPS & route telemetry"
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3 Arrival Timings Grid (Next Bus, Next Bus 2, Next Bus 3) */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <BusArrivalPill
          bus={service.NextBus}
          slotName="Next Bus"
          isPrimary={true}
        />
        <BusArrivalPill
          bus={service.NextBus2}
          slotName="Next Bus 2"
        />
        <BusArrivalPill
          bus={service.NextBus3}
          slotName="Next Bus 3"
        />
      </div>

      {/* Expanded Telemetry Drawer */}
      {isExpanded && (
        <div
          id={`bus-details-${service.ServiceNo}`}
          className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300 bg-[#0F1626]/80 p-3 rounded-xl"
        >
          <div>
            <p className="font-semibold text-slate-200 mb-1 flex items-center gap-1">
              <Bus className="w-3.5 h-3.5 text-sky-400" /> Route Code
            </p>
            <p className="text-[11px] text-slate-400">
              Origin: <span className="font-mono text-slate-200">{service.NextBus?.OriginCode || 'N/A'}</span>
            </p>
            <p className="text-[11px] text-slate-400">
              Dest: <span className="font-mono text-slate-200">{service.NextBus?.DestinationCode || 'N/A'}</span>
            </p>
          </div>

          <div>
            <p className="font-semibold text-slate-200 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Live GPS
            </p>
            <p className="text-[11px] text-slate-400">
              Lat: <span className="font-mono text-slate-200">{service.NextBus?.Latitude && service.NextBus.Latitude !== '0' ? service.NextBus.Latitude : 'Enroute'}</span>
            </p>
            <p className="text-[11px] text-slate-400">
              Lng: <span className="font-mono text-slate-200">{service.NextBus?.Longitude && service.NextBus.Longitude !== '0' ? service.NextBus.Longitude : 'Enroute'}</span>
            </p>
          </div>

          <div>
            <p className="font-semibold text-slate-200 mb-1">
              Trip Sequence
            </p>
            <p className="text-[11px] text-slate-400">
              Seq #: <span className="font-mono text-slate-200">{service.NextBus?.VisitNumber || '1'}</span>
            </p>
            <p className="text-[11px] text-slate-400">
              WAB: <span className="text-sky-400 font-semibold">{service.NextBus?.Feature === 'WAB' ? 'Yes (Accessible)' : 'Standard'}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
