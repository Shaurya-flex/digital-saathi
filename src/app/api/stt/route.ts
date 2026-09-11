import { NextResponse } from 'next/server';
import { callerFromRequest } from '@/lib/server/auth';
import { sarvamConfigured, transcribe } from '@/lib/server/sarvam';

/* Speech-to-text for browsers without the Web Speech API (Sarvam Saaras,
   built for Indian languages). Takes a short recorded clip as multipart
   form data; signed-in users only. */

export const runtime = 'nodejs';
export const maxDuration = 30;

const MAX_BYTES = 6 * 1024 * 1024;

export async function POST(req: Request) {
  const caller = await callerFromRequest(req);
  if (!caller) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  if (!sarvamConfigured()) return NextResponse.json({ error: 'Speech is not configured.' }, { status: 503 });
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }
  const audio = form.get('audio');
  const lang = String(form.get('lang') || '');
  if (!(audio instanceof Blob) || audio.size === 0) return NextResponse.json({ error: 'No audio.' }, { status: 400 });
  if (audio.size > MAX_BYTES) return NextResponse.json({ error: 'Clip too long.' }, { status: 413 });
  const ext = (audio.type.split('/')[1] || 'webm').replace(/;.*$/, '');
  const out = await transcribe(audio, 'clip.' + ext, lang || undefined);
  if (!out) return NextResponse.json({ error: 'Could not understand the audio.' }, { status: 502 });
  return NextResponse.json(out);
}
