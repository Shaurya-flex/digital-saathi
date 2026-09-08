'use client';

/* Home / Ask Saathi: 150px mic (190px in Easy Mode), voice sheet with the
   confirm-before-acting step, picture tiles, "waiting for you" strip, live
   mini tasks, conversation thread and the sticky get-a-person bar. */

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { CustomerShell } from '@/components/layout/Shell';
import { BigMicButton } from '@/components/voice/BigMicButton';
import { VoiceSheet } from '@/components/voice/VoiceSheet';
import { TaskCard } from '@/components/task/TaskCard';
import { StatusTag } from '@/components/ui/Tag';
import { useDB } from '@/hooks/useDB';
import { LANGS } from '@/lib/config';
import { handleAsk, humanNow } from '@/lib/engine/actions';
import { thread } from '@/lib/engine/taskEngine';
import { say, T } from '@/lib/i18n/useT';
import { firstName, me, mutate, speakNow, taskById, taskName, toast } from '@/lib/store';
import type { Lang, Task } from '@/lib/types';

const TILES = [
  { icon: '📱', en: 'Recharge a phone', hi: 'रिचार्ज कराइए', hin: 'Recharge karaiye', q: 'Mera mobile recharge kar do' },
  { icon: '💡', en: 'Pay a bill', hi: 'बिजली का बिल', hin: 'Bijli ka bill bharna hai', q: 'Bijli ka bill bharna hai' },
  { icon: '🔧', en: 'Call a repairman', hi: 'मिस्त्री बुलाइए', hin: 'Mistri bulaiye', q: 'Ghar ka fan kharab hai, electrician chahiye' },
  { icon: '📄', en: 'Explain a paper', hi: 'कागज़ समझाइए', hin: 'Kagaz samjhaiye', q: 'Ye document mujhe simple bhasha mein samjhao' },
  { icon: '🩺', en: 'Doctor’s time', hi: 'डॉक्टर का समय', hin: 'Doctor ka time lijiye', q: 'Kal doctor ka appointment chahiye' },
  { icon: '🚆', en: 'Find a train', hi: 'ट्रेन देखिए', hin: 'Train dekhiye', q: 'Delhi se Mumbai train dhoondo' },
];

function phaseWord(t: Task): string {
  return t.data.phase === 'approve' ? say('Approve', 'मंज़ूरी', 'Manzoori')
    : t.data.phase === 'failed' ? say('Failed', 'अटक गया', 'Atak gaya')
    : say('Your answer', 'जवाब दीजिए', 'Jawab dijiye');
}

export default function AskPage() {
  const { db, ready, version } = useDB();
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [box, setBox] = useState('');
  const threadRef = useRef<HTMLDivElement>(null);

  const u = ready ? me() : null;

  useEffect(() => {
    const el = threadRef.current;
    if (el && el.lastElementChild) el.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [version]);

  const ask = (q: string) => { if (q.trim()) handleAsk(q.trim()); };

  const body = !u || !db ? null : (() => {
    const mine = db.tasks.filter((t) => t.user_id === u.id);
    const live = mine.filter((t) => !['Completed', 'Cancelled', 'Failed', 'Refunded'].includes(t.status)).slice(0, 3);
    const waiting = live.filter((t) => ['clarify', 'ready', 'approve', 'failed'].includes(t.data.phase || ''));
    const th = thread();
    return (
      <>
        <div className="homehead">
          <div>
            <p className="hello">{T('greet')}, {firstName(u)}</p>
            <h2 className="askline">{T('askTitle')}</h2>
          </div>
          <div className="row">
            <select
              aria-label="Language" style={{ width: 'auto', minHeight: 38 }} value={u.lang}
              onChange={(e) => { mutate(() => { u.lang = e.target.value as Lang; }); toast('Language set.'); }}
            >
              {LANGS.map((l) => <option key={l[0]} value={l[0]}>{l[1]}</option>)}
            </select>
            <button
              className={'btn ' + (u.easy ? 'go' : 'ghost') + ' sm'}
              onClick={() => { const next = !u.easy; mutate(() => { u.easy = next; }); toast(next ? 'Easy Mode on.' : 'Easy Mode off.'); }}
            >
              {u.easy ? 'बड़ा टेक्स्ट · on' : 'Easy Mode'}
            </button>
          </div>
        </div>
        {['en', 'hi', 'hinglish'].includes(u.lang) ? null : (
          <p className="small muted">
            Saathi speaks this language in the app soon. For now the replies are in English so nothing about money is
            mistranslated.
          </p>
        )}

        <div className="micwrap">
          <BigMicButton onClick={() => setVoiceOpen(true)} />
          <p className="micLabel">{T('tapSpeak')}</p>
          <div className="typerow">
            <input
              type="text" placeholder={T('orType')} autoComplete="off" aria-label={T('orType')}
              value={box} onChange={(e) => setBox(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && box.trim()) { ask(box); setBox(''); } }}
            />
            <button className="btn" onClick={() => { if (box.trim()) { ask(box); setBox(''); } }}>{T('send')}</button>
          </div>
        </div>

        {waiting.length ? (
          <div className="needsyou">
            <strong>{T('needsYou')}</strong>
            {waiting.map((t) => (
              <Link key={t.task_id} className="needrow" href={`/app/task?id=${t.task_id}`}>
                <span>{taskName(t)}</span><span className="tag warm">{phaseWord(t)}</span>
              </Link>
            ))}
          </div>
        ) : null}

        <h3 className="sechead">{T('quickTasks')}</h3>
        <div className="tiles">
          {TILES.map((t) => (
            <button key={t.q} className="tile" onClick={() => ask(t.q)}>
              <span className="ticon" aria-hidden="true">{t.icon}</span>
              <span className="tlabel">{say(t.en, t.hi, t.hin)}</span>
            </button>
          ))}
        </div>

        {live.length ? (
          <>
            <h3 className="sechead">{T('running')}</h3>
            <div className="grid g2">
              {live.map((t) => (
                <Link key={t.task_id} className="card minitask" href={`/app/task?id=${t.task_id}`}>
                  <div className="between"><strong>{taskName(t)}</strong><StatusTag status={t.status} /></div>
                  <div className="small muted">{t.description.slice(0, 70)}</div>
                  {t.data.phase === 'working' ? (
                    <div className="bar">
                      <span style={{ width: Math.round(((t.data.work?.i || 0) / Math.max(1, t.data.work?.steps.length || 1)) * 100) + '%' }} />
                    </div>
                  ) : null}
                </Link>
              ))}
            </div>
          </>
        ) : null}

        <h3 className="sechead">{say('Conversation', 'बातचीत', 'Baat-cheet')}</h3>
        <div className="thread" ref={threadRef}>
          {th.length ? th.slice(-24).map((m, i) => (
            m.who === 'user'
              ? <div key={i} className="bubble me">{m.text}</div>
              : m.taskId
                ? (() => { const t = taskById(m.taskId!); return t ? <TaskCard key={i} task={t} onMic={() => setVoiceOpen(true)} /> : null; })()
                : (
                  <div key={i} className="bubble ai">
                    <div>{m.text}</div>
                    <button className="speakbtn" onClick={() => speakNow(m.text)}>🔊 {T('readAloud')}</button>
                  </div>
                )
          )) : (
            <div className="card center muted"><p style={{ margin: 0 }}>{T('nothingYet')}</p></div>
          )}
        </div>

        <button className="helpbar" onClick={() => humanNow()}>🧑 {T('human')}</button>
        {voiceOpen ? <VoiceSheet onSubmit={(txt) => ask(txt)} onClose={() => setVoiceOpen(false)} /> : null}
      </>
    );
  })();

  return <CustomerShell active="ask">{body}</CustomerShell>;
}
