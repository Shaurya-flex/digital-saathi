/* Maps adapter — geocoding, distance, provider matching support. The demo
   map is illustrative; production uses Google Maps or Mappls (India). */
export interface MapsAdapter {
  name: string; env: string; live: boolean;
  distanceKm(a: string, b: string): Promise<number>;
}
export const maps: MapsAdapter = {
  name: 'Maps', env: 'SAATHI_MAPS_KEY', live: false,
  async distanceKm(a, b) {
    console.info('[adapter:maps] mock distance', { a, b });
    return 2.4;
  },
};
