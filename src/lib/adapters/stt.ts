/* Speech-to-text adapter. In the browser the Web Speech API does the work
   (see src/components/voice/useVoice.ts); the server fallback (Whisper via
   SAATHI_LLM_SPEECH) transcribes uploaded audio when the browser has no STT. */
export interface SttAdapter {
  name: string; env: string; live: boolean | 'browser';
  transcribe(audio: Blob, lang: string): Promise<string>;
}
export const stt: SttAdapter = {
  name: 'Speech to text', env: 'SAATHI_STT_KEY', live: 'browser',
  async transcribe(_audio, lang) {
    console.info('[adapter:stt] mock transcribe', { lang });
    return '';
  },
};
