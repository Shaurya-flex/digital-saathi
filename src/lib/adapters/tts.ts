/* Text-to-speech adapter. Browser speechSynthesis in demo mode; a server
   voice API can replace speak() without touching Easy Mode read-aloud. */
export interface TtsAdapter {
  name: string; env: string; live: boolean | 'browser';
  speak(text: string, lang: string): Promise<void>;
}
export const tts: TtsAdapter = {
  name: 'Text to speech', env: 'SAATHI_TTS_KEY', live: 'browser',
  async speak(text, lang) {
    if (typeof window === 'undefined') return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang; u.rate = 0.9;
      window.speechSynthesis.speak(u);
    } catch { /* no TTS in this browser */ }
  },
};
