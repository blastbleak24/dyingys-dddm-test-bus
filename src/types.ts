export interface LTANextBus {
  OriginCode?: string;
  DestinationCode?: string;
  EstimatedArrival: string;
  Latitude?: string;
  Longitude?: string;
  VisitNumber?: string;
  Load?: 'SEA' | 'SDA' | 'LSD' | string;
  Feature?: 'WAB' | string;
  Type?: 'SD' | 'DD' | 'BD' | string;
}

export interface LTABusService {
  ServiceNo: string;
  Operator: string;
  NextBus?: LTANextBus;
  NextBus2?: LTANextBus;
  NextBus3?: LTANextBus;
}

export interface LTABusArrivalResponse {
  'odata.metadata'?: string;
  BusStopCode: string;
  Services: LTABusService[];
}

export interface BusStopInfo {
  code: string;
  name: string;
  road: string;
  region?: string;
  services?: string[];
}

export type LoadStatus = 'SEA' | 'SDA' | 'LSD';
export type BusType = 'SD' | 'DD' | 'BD';
