import { SarvamAIClient } from 'sarvamai';

/* Sarvam AI — the Indian-language layer: natural Hindi/regional text-to-
   speech (Bulbul), speech-to-text for Indic languages (Saaras) and
   translation (Mayura / sarvam-translate). Server-side only; the key lives
   in SARVAM_API_KEY. Every helper returns null when the key is absent or
   the call fails, so callers fall back to the browser's own speech APIs. */

type TtsRequest = Parameters<SarvamAIClient['textToSpeech']['convert']>[0];
type SttRequest = Parameters<SarvamAIClient['speechToText']['transcribe']>[0];
type TranslateRequest = Parameters<SarvamAIClient['text']['translate']>[0];

export const sarvamConfigured = () => Boolean((process.env.SARVAM_API_KEY || '').trim());

let client: SarvamAIClient | null = null;
function sarvam(): SarvamAIClient | null {
  if (!sarvamConfigured()) return null;
  if (!client) client = new SarvamAIClient({ apiSubscriptionKey: process.env.SARVAM_API_KEY });
  return client;
}

/** App language codes → Sarvam BCP-47 codes. Hinglish is spoken Hindi. */
const LANG: Record<string, string> = {
  en: 'en-IN', hi: 'hi-IN', hinglish: 'hi-IN', bn: 'bn-IN', mr: 'mr-IN', te: 'te-IN',
  ta: 'ta-IN', gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN', or: 'od-IN',
};
export const sarvamLang = (appLang?: string) => LANG[appLang || 'en'] || 'en-IN';

/** Languages the app cannot render natively — the LLM answers in English
    and Sarvam translates. (en/hi/hinglish are produced by the model.) */
export const needsTranslation = (appLang?: string) =>
  ['bn', 'mr', 'te', 'ta', 'gu', 'kn', 'ml', 'pa', 'or'].includes(appLang || '');

/** Base64 WAV of the spoken text, or null. */
export async function speak(text: string, appLang?: string): Promise<{ audio: string; mime: string } | null> {
  const c = sarvam();
  if (!c) return null;
  try {
    const req: TtsRequest = {
      text: text.slice(0, 1000),
      language_code: sarvamLang(appLang) as TtsRequest['language_code'],
      speaker: ((process.env.SARVAM_TTS_SPEAKER || 'anushka').trim()) as TtsRequest['speaker'],
      model: 'bulbul:v2',
      pace: 0.95,
      enable_preprocessing: true,
    };
    const res = await c.textToSpeech.convert(req);
    const audio = res.audios?.[0];
    return audio ? { audio, mime: 'audio/wav' } : null;
  } catch {
    return null;
  }
}

/** Transcript of an uploaded audio clip, or null. */
export async function transcribe(file: Blob, filename: string, appLang?: string): Promise<{ transcript: string; language?: string } | null> {
  const c = sarvam();
  if (!c) return null;
  try {
    const req: SttRequest = {
      file: { data: file, filename, contentType: file.type || 'audio/webm' },
      language_code: (appLang ? sarvamLang(appLang) : 'unknown') as SttRequest['language_code'],
      mode: 'transcribe',
    };
    const res = await c.speechToText.transcribe(req);
    return res.transcript ? { transcript: res.transcript.trim(), language: res.language_code } : null;
  } catch {
    return null;
  }
}

/** English → the user's language, in a modern spoken register; null on failure. */
export async function translateForLang(text: string, appLang: string): Promise<string | null> {
  const c = sarvam();
  if (!c || !needsTranslation(appLang)) return null;
  try {
    const req: TranslateRequest = {
      input: text.slice(0, 2000),
      source_language_code: 'en-IN',
      target_language_code: sarvamLang(appLang) as TranslateRequest['target_language_code'],
      mode: 'modern-colloquial',
    };
    const res = await c.text.translate(req);
    return res.translated_text?.trim() || null;
  } catch {
    return null;
  }
}
