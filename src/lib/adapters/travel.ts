/* Travel adapter — train/flight/bus search. Search is automated; the IRCTC
   booking itself always goes to a human agent (login + captcha). */
export interface TrainOption {
  no: string; name: string; dep: string; arr: string; cls: string;
  fare: number; avail: string; from: string; to: string;
}
export interface TravelAdapter {
  name: string; env: string; live: boolean;
  trains(from: string, to: string): TrainOption[];
}
export const travel: TravelAdapter = {
  name: 'Travel API', env: 'SAATHI_TRAVEL_KEY', live: false,
  trains(from, to) {
    return [
      { no: '12951', name: 'Rajdhani Express', dep: '16:25', arr: '08:15', cls: '3A', fare: 2310, avail: 'AVL 22' },
      { no: '12953', name: 'August Kranti Rajdhani', dep: '17:40', arr: '09:45', cls: '3A', fare: 2185, avail: 'RAC 8' },
      { no: '12925', name: 'Paschim Express', dep: '11:25', arr: '05:30', cls: 'SL', fare: 640, avail: 'WL 14' },
    ].map((t) => ({ ...t, from, to }));
  },
};
