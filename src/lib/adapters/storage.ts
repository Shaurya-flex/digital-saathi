/* File-storage adapter (S3 / Cloudflare R2) for the document vault.
   Product rule: identity documents are never uploaded automatically. */
export interface StorageAdapter {
  name: string; env: string; live: boolean;
  upload(file: File, key: string): Promise<{ ok: boolean; key: string }>;
  signedUrl(key: string): Promise<string>;
}
export const storage: StorageAdapter = {
  name: 'File storage', env: 'SAATHI_STORAGE_KEY + SAATHI_STORAGE_BUCKET', live: false,
  async upload(_file, key) {
    console.info('[adapter:storage] mock upload', { key });
    return { ok: false, key };
  },
  async signedUrl(key) { return '#demo-' + key; },
};
