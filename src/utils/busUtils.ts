export function getArrivalDisplay(isoString?: string): {
  minutes: number | null;
  label: string;
  timeStr: string;
  isArriving: boolean;
  isDeparted: boolean;
} {
  if (!isoString) {
    return {
      minutes: null,
      label: 'No data',
      timeStr: '--:--',
      isArriving: false,
      isDeparted: false,
    };
  }

  const arrivalDate = new Date(isoString);
  if (isNaN(arrivalDate.getTime())) {
    return {
      minutes: null,
      label: 'Invalid',
      timeStr: '--:--',
      isArriving: false,
      isDeparted: false,
    };
  }

  const now = Date.now();
  const diffMs = arrivalDate.getTime() - now;
  const minutes = Math.floor(diffMs / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);

  const timeStr = arrivalDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  if (diffMs <= 20000 && diffMs >= -60000) {
    return {
      minutes: 0,
      label: 'Arr',
      timeStr,
      isArriving: true,
      isDeparted: false,
    };
  }

  if (diffMs < -60000) {
    return {
      minutes: minutes,
      label: 'Left',
      timeStr,
      isArriving: false,
      isDeparted: true,
    };
  }

  if (minutes === 0) {
    return {
      minutes: 0,
      label: seconds > 0 ? `<1 min` : 'Arr',
      timeStr,
      isArriving: true,
      isDeparted: false,
    };
  }

  return {
    minutes,
    label: `${minutes}m`,
    timeStr,
    isArriving: false,
    isDeparted: false,
  };
}

export function getLoadBadge(load?: string) {
  switch (load) {
    case 'SEA':
      return {
        code: 'SEA',
        label: 'Seats Available',
        shortLabel: 'Seats Avail',
        textColor: 'text-emerald-400',
        barBg: 'bg-emerald-500/20',
        barFill: 'bg-emerald-500',
        barWidth: '80%',
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
      };
    case 'SDA':
      return {
        code: 'SDA',
        label: 'Standing Available',
        shortLabel: 'Standing',
        textColor: 'text-amber-400',
        barBg: 'bg-amber-500/20',
        barFill: 'bg-amber-500',
        barWidth: '60%',
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
      };
    case 'LSD':
      return {
        code: 'LSD',
        label: 'Limited Standing',
        shortLabel: 'Limited Stand',
        textColor: 'text-red-500',
        barBg: 'bg-red-500/20',
        barFill: 'bg-red-500',
        barWidth: '95%',
        bg: 'bg-red-500/10 text-red-400 border-red-500/30',
        dot: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]',
      };
    default:
      return {
        code: 'NA',
        label: 'Unknown Load',
        shortLabel: 'Unknown',
        textColor: 'text-slate-500',
        barBg: 'bg-slate-800',
        barFill: 'bg-slate-700',
        barWidth: '40%',
        bg: 'bg-slate-800 text-slate-400 border-slate-700',
        dot: 'bg-slate-500',
      };
  }
}

export function getBusTypeLabel(type?: string) {
  switch (type) {
    case 'SD':
      return { code: 'SD', name: 'Single Deck', short: 'Single' };
    case 'DD':
      return { code: 'DD', name: 'Double Deck', short: 'Double' };
    case 'BD':
      return { code: 'BD', name: 'Bendy Bus', short: 'Bendy' };
    default:
      return { code: type || 'SD', name: 'Standard Bus', short: 'Bus' };
  }
}

export function getOperatorDetails(operator?: string) {
  switch (operator?.toUpperCase()) {
    case 'SBST':
      return { name: 'SBS Transit', color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/40' };
    case 'SMRT':
      return { name: 'SMRT Buses', color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/40' };
    case 'TTS':
      return { name: 'Tower Transit', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40' };
    case 'GAS':
      return { name: 'Go-Ahead SG', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40' };
    default:
      return { name: operator || 'SG Bus', color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' };
  }
}
