import { BusStopInfo } from '../types';

export const POPULAR_BUS_STOPS: BusStopInfo[] = [
  {
    code: '83139',
    name: 'Eunos Stn / Int',
    road: 'Sims Ave / Jln Eunos',
    region: 'East',
    services: ['2', '7', '13', '15', '21', '24', '26', '28', '30', '51', '60', '61', '63', '67', '93', '94', '150', '154', '155'],
  },
  {
    code: '01012',
    name: 'Hotel Grand Pacific',
    road: 'Victoria St',
    region: 'Central',
    services: ['2', '7', '12', '32', '33', '51', '61', '63', '80', '175', '197'],
  },
  {
    code: '03211',
    name: 'Somerset Stn',
    road: 'Orchard Rd',
    region: 'Central',
    services: ['7', '14', '16', '36', '65', '77', '106', '111', '123', '124', '143', '167', '174', '190', '502', '518'],
  },
  {
    code: '08057',
    name: 'Dhoby Ghaut Stn Exit B',
    road: 'Orchard Rd',
    region: 'Central',
    services: ['7', '14', '16', '36', '77', '106', '111', '124', '167', '174', '175', '190'],
  },
  {
    code: '04111',
    name: 'City Hall Stn Exit B',
    road: 'Nth Bridge Rd',
    region: 'Central',
    services: ['32', '51', '61', '63', '80', '124', '145', '166', '174', '197'],
  },
  {
    code: '03019',
    name: 'Opp The Treasury',
    road: 'High St',
    region: 'Central',
    services: ['51', '61', '63', '80', '124', '145', '166', '174', '197'],
  },
  {
    code: '05013',
    name: 'Chinatown Stn Exit E',
    road: 'Eu Tong Sen St',
    region: 'Central',
    services: ['2', '12', '33', '54', '61', '63', '80', '124', '143', '145', '147', '190', '851', '970'],
  },
  {
    code: '03509',
    name: 'Marina Bay Sands Hotel',
    road: 'Bayfront Ave',
    region: 'South',
    services: ['97', '106', '133', '502', '518'],
  },
  {
    code: '75009',
    name: 'Tampines Int',
    road: 'Tampines Ctrl 1',
    region: 'East',
    services: ['3', '4', '8', '10', '19', '20', '23', '28', '29', '31', '37', '38', '46', '65', '67', '68', '69', '72', '81', '291', '292', '293'],
  },
  {
    code: '84009',
    name: 'Bedok Int',
    road: 'Bedok Nth Dr',
    region: 'East',
    services: ['7', '9', '14', '16', '17', '18', '26', '30', '32', '33', '35', '38', '40', '60', '66', '69', '87', '168', '196', '197', '222', '225', '228', '229'],
  },
  {
    code: '28009',
    name: 'Jurong East Int',
    road: 'Jurong Gateway Rd',
    region: 'West',
    services: ['41', '49', '51', '52', '66', '78', '79', '97', '98', '105', '143', '160', '183', '197', '333', '334', '335', '506'],
  },
  {
    code: '46009',
    name: 'Woodlands Temp Int',
    road: 'Woodlands Sq',
    region: 'North',
    services: ['161', '168', '169', '178', '187', '856', '858', '900', '901', '902', '903', '904', '911', '912', '913', '925', '950', '960', '961', '962', '963', '964', '965', '966', '969'],
  },
  {
    code: '53009',
    name: 'Bishan Int',
    road: 'Bishan St 13',
    region: 'Central',
    services: ['50', '52', '53', '54', '55', '56', '57', '58', '59', '410'],
  },
  {
    code: '54009',
    name: 'Ang Mo Kio Int',
    road: 'AMK Ave 8',
    region: 'Central',
    services: ['22', '24', '25', '73', '86', '130', '133', '135', '136', '138', '166', '169', '261', '262', '265', '268', '269'],
  },
  {
    code: '17009',
    name: 'Clementi Int',
    road: 'Clementi Ave 3',
    region: 'West',
    services: ['7', '14', '96', '99', '147', '156', '165', '166', '173', '175', '196', '282', '284', '285'],
  },
  {
    code: '66009',
    name: 'Serangoon Int',
    road: 'Serangoon Ave 2',
    region: 'North-East',
    services: ['100', '101', '103', '105', '109', '158', '315', '317'],
  },
  {
    code: '95129',
    name: 'Changi Airport PTB2',
    road: 'PTB2 Basement',
    region: 'East',
    services: ['24', '27', '34', '36', '53', '110', '858'],
  },
  {
    code: '14141',
    name: 'HarbourFront Stn/Vivocity',
    road: 'Telok Blangah Rd',
    region: 'South',
    services: ['10', '30', '57', '61', '65', '80', '97', '100', '131', '143', '145', '166', '188', '855', '963'],
  },
  {
    code: '65009',
    name: 'Punggol Temp Int',
    road: 'Punggol Pl',
    region: 'North-East',
    services: ['3', '34', '43', '62', '82', '83', '84', '85', '117', '118', '119', '136', '381', '382', '386'],
  },
  {
    code: '77009',
    name: 'Pasir Ris Int',
    road: 'Pasir Ris Dr 3',
    region: 'East',
    services: ['3', '5', '6', '12', '15', '17', '21', '58', '88', '89', '354', '358', '359', '403', '518'],
  }
];

export function getBusStopDetails(code: string): BusStopInfo {
  const normalized = code.trim().padStart(5, '0');
  const found = POPULAR_BUS_STOPS.find(s => s.code === normalized || s.code === code.trim());
  if (found) {
    return found;
  }
  return {
    code: normalized,
    name: `Bus Stop ${normalized}`,
    road: 'Singapore Road Network',
    region: 'Singapore',
  };
}
