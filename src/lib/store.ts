'use client';

/* Demo-mode store. The whole database lives in localStorage under one key,
   exactly like the validated prototype, with a tiny subscription layer so
   React components re-render on every commit. In production the reads move
   behind the database client (src/lib/db) and the writes behind API routes —
   the shapes are identical, so components do not change. */

import { SEED, uid, now } from './seed';
import { DEFAULT_CONFIG } from './config';
import type { DBShape, SaathiConfig, Task, User } from './types';

const KEY = 'digital_saathi_v1';

let DB: DBShape | null = null;
let version = 0;
const listeners = new Set<() => void>();

export function getDB(): DBShape {
  if (DB) return DB;
  if (typeof window === 'undefined') {
    // Server render never mutates; hand back a throwaway seed.
    return SEED();
  }
  try {
    const raw = localStorage.getItem(KEY);
    DB = raw ? (JSON.parse(raw) as DBShape) : SEED();
  } catch {
    DB = SEED();
  }
  if (!DB.config) DB.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG)) as SaathiConfig;
  if (!DB.threads) DB.threads = {};
  if (!DB.ui) DB.ui = {};
  if (!DB.reminders) DB.reminders = [];
  // Older saves predate provider coordinates — backfill from the seed by id.
  if (DB.providers.some((p) => p.lat == null)) {
    const fresh = SEED().providers;
    DB.providers.forEach((p) => {
      const f = fresh.find((x) => x.id === p.id);
      if (f && p.lat == null) { p.lat = f.lat; p.lng = f.lng; }
    });
  }
  return DB;
}

function save() {
  if (!DB || typeof window === 'undefined') return;
  try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch { /* storage may be unavailable */ }
}

export function commit() {
  save();
  version++;
  listeners.forEach((l) => l());
}

/** Run a mutation against the store and notify subscribers. */
export function mutate<T>(fn: (db: DBShape) => T): T {
  const db = getDB();
  const out = fn(db);
  commit();
  return out;
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
export const getVersion = () => version;

export function resetAll() {
  DB = SEED();
  commit();
}

/** Replace the whole database (backup restore / switching demo ↔ real mode). */
export function replaceDB(next: DBShape) {
  DB = next;
  commit();
}

/* ---------- session + config ---------- */
export const me = (): User | null => {
  const db = getDB();
  return db.users.find((u) => u.id === db.session) || null;
};
export const cfg = (): SaathiConfig => getDB().config;

/* ---------- shared helpers (ported) ---------- */
export { uid, now };
export const money = (n: number | null | undefined) => '₹' + Number(n || 0).toLocaleString('en-IN');
export const when = (iso: string) => {
  const d = new Date(iso);
  const m = (Date.now() - d.getTime()) / 6e4;
  if (m < 1) return 'just now';
  if (m < 60) return Math.round(m) + ' min ago';
  if (m < 1440) return Math.round(m / 60) + ' hr ago';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};
export const firstName = (u: User | null) => (u?.name || '').replace(/\s*\(.*\)/, '').split(' ')[0];
export const taskName = (t: Task) => t.data.title || t.intent;
export const taskById = (id: string) => getDB().tasks.find((t) => t.task_id === id);
export const unread = () => {
  const db = getDB();
  return db.notifications.filter((n) => n.userId === db.session && !n.read).length;
};

/* ---------- analytics + ledger + notifications ---------- */
export function track(name: string, props?: Record<string, unknown>) {
  const db = getDB();
  db.events.push({ name, props: props || {}, at: now(), user: db.session });
  if (db.events.length > 500) db.events.shift();
}

export function notify(userId: string, title: string, body: string, kind: 'info' | 'warn' = 'info') {
  getDB().notifications.unshift({ id: uid('n'), userId, title, body, kind, at: now(), read: false });
}

export function chargeCredits(t: Task | null, n: number, reason: string): boolean {
  const u = me();
  if (!u) return false;
  if ((u.credits || 0) < n) {
    toast(`Not enough credits. ${u.credits} left, ${n} needed.`, 'warn');
    return false;
  }
  u.credits = (u.credits || 0) - n;
  getDB().ledger.push({ id: uid('lg'), userId: u.id, type: 'credits', dir: 'debit', amount: n, reason, taskId: t ? t.task_id : null, at: now() });
  track('credits_consumed', { n, reason });
  return true;
}

export function addCredits(userId: string, n: number, reason: string) {
  const db = getDB();
  const u = db.users.find((x) => x.id === userId);
  if (!u) return;
  u.credits = (u.credits || 0) + n;
  db.ledger.push({ id: uid('lg'), userId, type: 'credits', dir: 'credit', amount: n, reason, at: now() });
}

/* ---------- toast bus ---------- */
export interface ToastMsg { id: number; msg: string; kind?: 'ok' | 'warn' }
let toastId = 0;
const toastListeners = new Set<(t: ToastMsg) => void>();
export function toast(msg: string, kind?: 'ok' | 'warn') {
  const t = { id: ++toastId, msg, kind };
  toastListeners.forEach((l) => l(t));
}
export function onToast(fn: (t: ToastMsg) => void): () => void {
  toastListeners.add(fn);
  return () => toastListeners.delete(fn);
}

/* ---------- speech (browser TTS via the tts adapter contract) ---------- */
/* A better voice can be plugged in (Sarvam, registered by AppBoot). It is
   tried first; if it cannot play, the browser's own synthesis speaks. */
type Speaker = (text: string, lang: string) => Promise<boolean>;
let speakOverride: Speaker | null = null;
export function setSpeakOverride(fn: Speaker | null) { speakOverride = fn; }

function browserSpeak(text: string, idx: number) {
  try {
    window.speechSynthesis.cancel();
    const ut = new SpeechSynthesisUtterance(String(text).replace(/<[^>]+>/g, ' '));
    ut.lang = idx ? 'hi-IN' : 'en-IN';
    ut.rate = 0.9;
    window.speechSynthesis.speak(ut);
  } catch {
    toast('Read-aloud not available in this browser.');
  }
}

export function speakNow(text: string, langIdx?: number) {
  const u = me();
  const idx = langIdx ?? (u && u.lang === 'hi' ? 1 : u && u.lang === 'hinglish' ? 2 : 0);
  const lang = langIdx == null ? (u?.lang || 'en') : (langIdx === 1 ? 'hi' : langIdx === 2 ? 'hinglish' : 'en');
  if (speakOverride) {
    void speakOverride(text, lang).then((ok) => { if (!ok) browserSpeak(text, idx); });
    return;
  }
  browserSpeak(text, idx);
}
export function askAloud(text: string) {
  const u = me();
  if (u && u.easy && text) speakNow(text);
}
