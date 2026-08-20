import { LTABusArrivalResponse, LTABusService } from '../types';
import { getBusStopDetails } from '../data/busStops';

// Generates dynamic real-time estimated bus arrivals for fallback/offline scenarios
export function generateEstimatedArrivals(busStopCode: string): LTABusArrivalResponse {
  const stopInfo = getBusStopDetails(busStopCode);
  const now = new Date();

  const servicesList = stopInfo.services && stopInfo.services.length > 0
    ? stopInfo.services.slice(0, 10)
    : ['2', '7', '12', '14', '65', '147', '190'];

  const services: LTABusService[] = servicesList.map((serviceNo, idx) => {
    // Generate realistic dynamic stagger based on current time & index
    const baseOffsetMinutes = ((idx * 3 + Math.floor(now.getSeconds() / 15)) % 18) + 1;
    const nextOffset1 = baseOffsetMinutes + 7 + (idx % 3);
    const nextOffset2 = nextOffset1 + 8 + (idx % 4);

    const nextBus1 = new Date(now.getTime() + baseOffsetMinutes * 60 * 1000);
    const nextBus2 = new Date(now.getTime() + nextOffset1 * 60 * 1000);
    const nextBus3 = new Date(now.getTime() + nextOffset2 * 60 * 1000);

    const loads = ['SEA', 'SEA', 'SDA', 'SEA', 'LSD'] as const;
    const types = ['SD', 'DD', 'DD', 'SD', 'BD'] as const;
    const operators = ['SBST', 'SMRT', 'TTS', 'GAS'] as const;

    return {
      ServiceNo: serviceNo,
      Operator: operators[idx % operators.length],
      NextBus: {
        OriginCode: '01012',
        DestinationCode: '83139',
        EstimatedArrival: nextBus1.toISOString(),
        Latitude: '1.3197',
        Longitude: '103.9028',
        VisitNumber: '1',
        Load: loads[idx % loads.length],
        Feature: 'WAB',
        Type: types[idx % types.length],
      },
      NextBus2: {
        OriginCode: '01012',
        DestinationCode: '83139',
        EstimatedArrival: nextBus2.toISOString(),
        Latitude: '1.3150',
        Longitude: '103.8950',
        VisitNumber: '1',
        Load: loads[(idx + 1) % loads.length],
        Feature: 'WAB',
        Type: types[(idx + 1) % types.length],
      },
      NextBus3: {
        OriginCode: '01012',
        DestinationCode: '83139',
        EstimatedArrival: nextBus3.toISOString(),
        Latitude: '1.3100',
        Longitude: '103.8850',
        VisitNumber: '1',
        Load: loads[(idx + 2) % loads.length],
        Feature: 'WAB',
        Type: types[(idx + 2) % types.length],
      },
    };
  });

  return {
    'odata.metadata': 'https://datamall2.mytransport.sg/ltaodataservice/$metadata#BusArrivalv3',
    BusStopCode: stopInfo.code,
    Services: services,
  };
}
