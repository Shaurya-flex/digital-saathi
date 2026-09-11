import { NextResponse } from 'next/server';
import { callerFromRequest } from '@/lib/server/auth';
import { sarvamConfigured, speak } from '@/lib/server/sarvam';

/* Natural Indian-language read-aloud (Sarvam Bulbul) for Easy Mode and the
   🔊 buttons. Signed-in users only; the browser falls back to its own
   speech synthesis when this returns anything but audio. */

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: Request) {
  const caller = await callerFromRequest(req);
  if (!caller) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  if (!sarvamConfigured()) return NextResponse.json({ error: 'Speech is not configured.' }, { status: 503 });
  let body: { text?: string; lang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }
  const text = String(body.text || '').replace(/<[^>]+>/g, ' ').trim();
  if (!text || text.length > 1000) return NextResponse.json({ error: 'Text too long.' }, { status: 400 });
  const out = await speak(text, body.lang);
  if (!out) return NextResponse.json({ error: 'Could not synthesise speech.' }, { status: 502 });
  return NextResponse.json(out);
}
