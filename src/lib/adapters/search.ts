/* Web search adapter — backs 'research' and 'deep_research' credit tasks. */
export interface SearchResult { title: string; url: string; snippet: string }
export interface SearchAdapter {
  name: string; env: string; live: boolean;
  search(q: string): Promise<SearchResult[]>;
}
export const search: SearchAdapter = {
  name: 'Web search', env: 'SAATHI_SEARCH_KEY', live: false,
  async search(q) {
    console.info('[adapter:search] mock search', { q });
    return [];
  },
};
