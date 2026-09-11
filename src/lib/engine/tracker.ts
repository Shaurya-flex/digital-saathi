import { getDB, notify, taskName, track, commit, now } from '../store';
import { say } from '../i18n/useT';
import { logTask, setStatus, step } from './taskEngine';
import type { Booking, Task } from '../types';

/* Live tracking of the two human executors. The mock progresses on a timer,
   compressed to seconds for demos; in production the stages come from the
   provider/agent portal actions (and Pusher pushes them to the customer). */

export interface TrackStage { k: string; at: number; en: string; hi: string; hin: string }

export const TRACKS: Record<'provider' | 'agent', TrackStage[]> = {
  provider: [
    { k: 'requested', at: 0, en: 'Request sent', hi: 'अनुरोध भेजा गया', hin: 'Request bheja gaya' },
    { k: 'accepted', at: 6, en: 'Professional accepted', hi: 'कारीगर ने हाँ कहा', hin: 'Kaarigar ne haan kaha' },
    { k: 'on_way', at: 14, en: 'On the way to you', hi: 'आपके यहाँ आ रहे हैं', hin: 'Aapke yahan aa rahe hain' },
    { k: 'arrived', at: 24, en: 'Reached your address', hi: 'आपके पते पर पहुँच गए', hin: 'Aapke pate par pahunch gaye' },
    { k: 'working', at: 30, en: 'Work in progress', hi: 'काम चल रहा है', hin: 'Kaam chal raha hai' },
  ],
  agent: [
    { k: 'queued', at: 0, en: 'Waiting in the agent queue', hi: 'एजेंट की कतार में', hin: 'Agent ki kataar mein' },
    { k: 'claimed', at: 8, en: 'An agent picked it up', hi: 'एक एजेंट ने काम लिया', hin: 'Ek agent ne kaam liya' },
    { k: 'working', at: 18, en: 'Agent is working on it', hi: 'एजेंट काम कर रहे हैं', hin: 'Agent kaam kar rahe hain' },
    { k: 'done', at: 38, en: 'Agent finished', hi: 'एजेंट ने पूरा किया', hin: 'Agent ne poora kiya' },
  ],
};

export function startTrack(t: Task, kind: 'provider' | 'agent') {
  // Real accounts never get a pretend professional/agent marching through
  // stages on a timer — the stage only moves when a real person acts.
  t.data.track = { kind, stage: TRACKS[kind][0].k, startedAt: Date.now(), mock: getDB().mode !== 'real' };
  t.data.phase = 'tracking';
}

export function trackIndex(t: Task): number {
  const tr = t.data.track;
  if (!tr) return 0;
  return Math.max(0, TRACKS[tr.kind].findIndex((s) => s.k === tr.stage));
}

function finishAgentTask(t: Task) {
  const db = getDB();
  const a = db.agents.find((x) => x.id === t.assigned_agent) || db.agents[0];
  t.data.phase = 'done';
  t.data.track = null;
  t.data.result = t.intent === 'train'
    ? say(`${a.name} booked your ticket. PNR and seat details are in your documents.`,
          `${a.name} ने आपका टिकट बुक कर दिया। पीएनआर और सीट की जानकारी आपके कागज़ों में है।`,
          `${a.name} ne aapka ticket book kar diya. PNR aur seat ki jankari aapke documents mein hai.`)
    : say(`${a.name} completed this and left a note for you.`,
          `${a.name} ने यह काम पूरा किया और आपके लिए एक टिप्पणी छोड़ी है।`,
          `${a.name} ne ye kaam poora kiya aur aapke liye ek note chhoda hai.`);
  setStatus(t, 'Completed', 'Completed by agent ' + a.name);
  t.completed_at = now();
  a.earnings += 96;
  a.done++;
  notify(t.user_id, say('Your task is done', 'आपका काम हो गया', 'Aapka kaam ho gaya'), taskName(t), 'info');
  track('task_completed', { intent: t.intent, by: 'agent' });
}

/** Advance every mock tracker whose timer has passed a stage boundary. */
export function syncMock(): boolean {
  const db = getDB();
  let changed = false;
  db.tasks.forEach((t) => {
    const tr = t.data.track;
    if (!tr || !tr.mock || t.data.phase !== 'tracking') return;
    const secs = (Date.now() - tr.startedAt) / 1000;
    const list = TRACKS[tr.kind];
    let target = list[0];
    list.forEach((s) => { if (secs >= s.at) target = s; });
    if (target.k !== tr.stage) {
      tr.stage = target.k;
      changed = true;
      step(t, say(target.en, target.hi, target.hin), 'ok');
      logTask(t, 'Executor update', tr.kind + ' → ' + target.k);
      if (tr.kind === 'provider') {
        const b = db.bookings.find((x) => x.taskId === t.task_id);
        if (b) b.status = target.k === 'accepted' ? 'Accepted' : target.k === 'working' ? 'In progress' : b.status;
        if (target.k === 'accepted') notify(t.user_id, say('Your professional accepted', 'कारीगर ने हाँ कहा', 'Kaarigar ne haan kaha'), taskName(t), 'info');
        if (target.k === 'on_way') notify(t.user_id, say('On the way', 'आ रहे हैं', 'Aa rahe hain'), say('Arriving shortly.', 'थोड़ी देर में पहुँचेंगे।', 'Thodi der mein pahunchenge.'), 'info');
      }
      if (tr.kind === 'agent') {
        if (target.k === 'claimed') {
          const a = db.agents.find((x) => x.online) || db.agents[0];
          t.assigned_agent = a.id;
          logTask(t, 'Claimed by agent', a.name);
          setStatus(t, 'In progress', 'Agent ' + a.name + ' is working');
        }
        if (target.k === 'done') finishAgentTask(t);
      }
    }
  });
  return changed;
}

let TICKER: ReturnType<typeof setInterval> | null = null;
export function ensureTicker() {
  if (TICKER || typeof window === 'undefined') return;
  TICKER = setInterval(() => {
    const db = getDB();
    const live = db.tasks.some((t) => t.data.track && t.data.phase === 'tracking');
    if (syncMock()) commit();
    if (!live) { clearInterval(TICKER!); TICKER = null; }
  }, 1500);
}

/** Portal actions drive the real stages (mock timer switches off). */
export function setExecStage(b: Booking | undefined, stage: string, detail?: string) {
  if (!b) return;
  const db = getDB();
  const t = db.tasks.find((x) => x.task_id === b.taskId);
  if (!t || !t.data.track) return;
  const list = TRACKS[t.data.track.kind];
  const s = list.find((x) => x.k === stage);
  if (!s) return;
  t.data.track.mock = false;
  t.data.track.stage = stage;
  step(t, say(s.en, s.hi, s.hin), 'ok');
  logTask(t, 'Executor update', detail || stage);
}
