'use client';

/* Agent portal — 6 pages: dashboard, queue, assigned, earnings, performance,
   profile. Ported 1:1 from the validated prototype. */

import { AgentShell } from '@/components/layout/Shell';
import { EconomicsBar } from '@/components/supply/EconomicsBar';
import { DemoFlag } from '@/components/ui/DemoFlag';
import { StatusTag } from '@/components/ui/Tag';
import { useDB } from '@/hooks/useDB';
import { LANGS } from '@/lib/config';
import { setStatus } from '@/lib/engine/taskEngine';
import { say } from '@/lib/i18n/useT';
import { cfg, money, mutate, notify, now, taskName, toast, when } from '@/lib/store';
import type { Agent, DBShape, Task } from '@/lib/types';

function useAgent(): { db: DBShape | null; a: Agent | null } {
  const { db, ready } = useDB();
  if (!ready || !db) return { db: null, a: null };
  const a = db.agents.find((x) => x.id === db.session) || db.agents[0];
  return { db, a };
}

function claimTask(a: Agent, t: Task) {
  mutate(() => {
    t.assigned_agent = a.id;
    t.data.step = 'assigned';
    setStatus(t, 'In progress', 'Claimed by ' + a.name);
    notify(t.user_id, 'An agent has taken your task', a.name + ' is working on it.', 'info');
  });
  toast('Claimed.', 'ok');
}
function agentDone(a: Agent, t: Task) {
  mutate(() => {
    setStatus(t, 'Completed', 'Completed by agent');
    t.completed_at = now();
    t.result = 'Completed by ' + a.name;
    a.earnings += 96;
    a.done++;
    notify(t.user_id, 'Your task is done', taskName(t) + ' has been completed.', 'info');
  });
  toast('Completed. ₹96 added to your earnings.', 'ok');
}
function agentAsk(t: Task) {
  mutate(() => {
    setStatus(t, 'Waiting for information', 'Agent asked the customer a question');
    notify(t.user_id, 'Your agent needs one detail', 'Open the task to reply.', 'warn');
  });
  toast('Question sent.');
}

function QueueRows({ db, a, list }: { db: DBShape; a: Agent; list: Task[] }) {
  const earn = Math.round(cfg().pricing.human_agent * (1 - cfg().commission.agent));
  return (
    <>
      {list.map((t) => {
        const u = db.users.find((x) => x.id === t.user_id) || { name: 'Customer', lang: 'en', city: '' };
        const langStr = (LANGS.find((l) => l[0] === u.lang) || ['en', 'English'])[1];
        return (
          <div key={t.task_id} className="card mb agtask">
            <div className="between">
              <div>
                <strong>{taskName(t)}</strong>
                <div className="small muted">{u.name} · {u.city} · {say('speaks', 'भाषा', 'bhaasha')} {langStr}</div>
                <div className="small">{t.description}</div>
                <div className="tiny muted">{when(t.updated_at)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="tag warm">{say('Waiting', 'प्रतीक्षा', 'Pratiksha')}</span>
                <div className="small muted mt">{say('You earn', 'आपको', 'Aapko')}<br /><strong>{money(earn)}</strong></div>
              </div>
            </div>
            <div className="arow mt">
              <button className="btn go big" onClick={() => claimTask(a, t)}>{say('Claim this task', 'यह काम लें', 'Ye kaam lein')}</button>
            </div>
          </div>
        );
      })}
    </>
  );
}

function TaskRows({ db, a, list }: { db: DBShape; a: Agent; list: Task[] }) {
  const earn = Math.round(cfg().pricing.human_agent * (1 - cfg().commission.agent));
  return (
    <>
      {list.map((t) => {
        const u = db.users.find((x) => x.id === t.user_id) || { name: 'Customer', lang: 'en', city: '' };
        const done = ['Completed', 'Cancelled', 'Failed'].includes(t.status);
        return (
          <div key={t.task_id} className="card mb agtask">
            <div className="between">
              <div>
                <strong>{taskName(t)}</strong>
                <div className="small muted">{u.name} · {u.city}</div>
                <div className="small">{t.description}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <StatusTag status={t.status} />
                {done
                  ? <div className="small" style={{ color: 'var(--leaf)' }}><strong>{money(earn)}</strong> {say('paid', 'भुगतान', 'payment')}</div>
                  : <div className="small muted">{money(earn)} {say('on completion', 'पूरा होने पर', 'poora hone par')}</div>}
              </div>
            </div>
            {!done ? (
              <div className="arow mt">
                <button className="btn go big" onClick={() => agentDone(a, t)}>✓ {say('Mark complete', 'पूरा किया', 'Poora kiya')}</button>
                <button className="btn ghost big" onClick={() => agentAsk(t)}>? {say('Ask customer', 'ग्राहक से पूछें', 'Grahak se poochhen')}</button>
              </div>
            ) : <p className="tiny muted">{when(t.completed_at || t.updated_at)}</p>}
          </div>
        );
      })}
    </>
  );
}

export function AgentPortal({ page }: { page: string }) {
  const { db, a } = useAgent();
  if (!db || !a) return <AgentShell active={page}><div /></AgentShell>;

  const open = db.tasks.filter((t) => t.status === 'Escalated to human' && !t.assigned_agent);
  const mine = db.tasks.filter((t) => t.assigned_agent === a.id);
  const active = mine.filter((t) => !['Completed', 'Cancelled', 'Failed'].includes(t.status));

  let body: React.ReactNode = null;

  if (page === 'queue') {
    body = (
      <>
        <h2>{say('Task queue', 'काम की कतार', 'Kaam ki kataar')}</h2>
        <p className="muted small">
          {say('These tasks could not be finished by the AI. First to claim gets it.', 'ये काम AI पूरे नहीं कर सका। पहले माँगने वाले को मिलेगा।', 'Ye kaam AI poore nahi kar saka. Pehle maangne wale ko milega.')}
        </p>
        <QueueRows db={db} a={a} list={open} />
        {!open.length ? (
          <div className="card center muted">
            {say('Queue is empty. New tasks appear here when the AI cannot handle them.', 'कतार खाली है। AI जो नहीं कर पाएगा, वह यहाँ आएगा।', 'Kataar khaali hai. AI jo nahi kar payega, woh yahan aayega.')}
          </div>
        ) : null}
      </>
    );
  } else if (page === 'assigned') {
    const hist = mine.filter((t) => ['Completed', 'Cancelled', 'Failed'].includes(t.status));
    body = (
      <>
        <h2>{say('My tasks', 'मेरे काम', 'Mere kaam')}</h2>
        <TaskRows db={db} a={a} list={active} />
        {hist.length ? (
          <>
            <h3 className="sechead">{say('Finished', 'पूरे हुए', 'Poore hue')}</h3>
            <TaskRows db={db} a={a} list={hist.slice(0, 6)} />
          </>
        ) : null}
        {!active.length && !hist.length ? (
          <div className="card center muted">
            {say('No tasks yet. Claim from the queue.', 'अभी कोई काम नहीं। कतार से लें।', 'Abhi koi kaam nahi. Kataar se lein.')}
          </div>
        ) : null}
      </>
    );
  } else if (page === 'earnings') {
    body = (
      <>
        <h2>{say('Earnings', 'कमाई', 'Kamai')}</h2>
        <div className="grid g3">
          <div className="stat"><span className="small muted">{say('Lifetime earned', 'कुल कमाई', 'Kul kamai')}</span><b>{money(a.earnings)}</b></div>
          <div className="stat"><span className="small muted">{say('This week', 'इस हफ़्ते', 'Is hafte')}</span><b>{money(a.wk_earnings || 0)}</b></div>
          <div className="stat"><span className="small muted">{say('Pending payout', 'लंबित', 'Lambhit')}</span><b>{money(a.pending || 0)}</b></div>
          <div className="stat"><span className="small muted">{say('Tasks done', 'काम पूरे', 'Kaam poore')}</span><b>{a.done}</b></div>
          <div className="stat"><span className="small muted">{say('Cancelled', 'रद्द', 'Radd')}</span><b>{a.cancel || 0}</b></div>
          <div className="stat"><span className="small muted">{say('Disputes', 'विवाद', 'Vivaad')}</span><b>{a.dispute || 0}</b></div>
        </div>
        <h3 className="sechead">{say('How it splits', 'बँटवारा', 'Bantwara')}</h3>
        <EconomicsBar customerPrice={120} commissionRate={cfg().commission.agent} label={say('You keep', 'आपको मिलता है', 'Aapko milta hai')} />
        <div className="card mt">
          <div className="between">
            <div>
              <strong>{say('Payout account', 'भुगतान खाता', 'Bhugtan khaata')}</strong>
              <p className="small muted" style={{ margin: '.2rem 0 0' }}>
                {say('Weekly on Tuesdays. Minimum ₹100.', 'हर मंगलवार। न्यूनतम ₹100।', 'Har Mangalwar. Minimum ₹100.')}
              </p>
            </div>
            <DemoFlag>Integration required</DemoFlag>
          </div>
        </div>
      </>
    );
  } else if (page === 'performance') {
    const verifs: Array<[key: 'aadhaar' | 'pan' | 'skill_test' | 'bg_check', en: string, hi: string, hin: string]> = [
      ['aadhaar', 'Aadhaar', 'आधार', 'Aadhaar'], ['pan', 'PAN', 'PAN', 'PAN'],
      ['skill_test', 'Skill test', 'कौशल परीक्षण', 'Skill test'], ['bg_check', 'Background check', 'पृष्ठभूमि जाँच', 'Background check'],
    ];
    body = (
      <>
        <h2>{say('Performance', 'प्रदर्शन', 'Pradarshan')}</h2>
        <div className="grid g4">
          <div className="stat"><span className="small muted">Rating</span><b>{a.rating}★</b></div>
          <div className="stat"><span className="small muted">SLA</span><b style={{ fontSize: '1rem', paddingTop: '.4rem' }}>{a.sla}</b></div>
          <div className="stat"><span className="small muted">{say('Cancel rate', 'रद्द %', 'Cancel %')}</span><b>{a.done ? Math.round((a.cancel || 0) / (a.done + (a.cancel || 0)) * 100) : 0}%</b></div>
          <div className="stat"><span className="small muted">{say('Dispute rate', 'विवाद %', 'Dispute %')}</span><b>{a.done ? Math.round((a.dispute || 0) / a.done * 100) : 0}%</b></div>
        </div>
        <h3 className="sechead">{say('Trust level', 'विश्वास स्तर', 'Vishwas star')}</h3>
        <div className="card">
          <div className="between">
            <strong>{a.level || 'Standard'}</strong>
            <span className={'tag ' + (a.level === 'Senior' ? 'go' : a.level === 'New' ? 'plain' : 'warn')}>{a.level || 'Standard'}</span>
          </div>
          <p className="small muted" style={{ margin: '.5rem 0 0' }}>
            {say('Standard agents earn ₹96/task. Senior agents (50+ tasks, SLA > 90%) earn ₹120/task and get priority queue access.',
                 'Standard agents ₹96/काम। Senior (50+ काम, SLA > 90%) को ₹120/काम और प्राथमिकता मिलती है।',
                 'Standard agents ₹96/kaam. Senior (50+ kaam, SLA > 90%) ko ₹120/kaam aur priority milti hai.')}
          </p>
        </div>
        <h3 className="sechead">{say('Verification', 'सत्यापन', 'Verification')}</h3>
        <div className="grid g2">
          {verifs.map(([k, en, hi, hin]) => {
            const v = a[k];
            const done = v === 'passed' || v === true;
            return (
              <div key={k} className="card">
                <div className="between">
                  <strong>{say(en, hi, hin)}</strong>
                  <span className={'tag ' + (done ? 'go' : v === 'pending' ? 'warn' : 'plain')}>
                    {done ? '✓ Done' : v === 'pending' ? 'Pending' : 'Not started'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  } else if (page === 'profile') {
    body = (
      <>
        <h2>{say('Your profile', 'आपकी प्रोफ़ाइल', 'Aapki profile')}</h2>
        <div className="card pad">
          <label className="f">{say('Full name', 'पूरा नाम', 'Poora naam')}</label>
          <input type="text" defaultValue={a.name} onBlur={(e) => mutate(() => { a.name = e.target.value || a.name; })} />
          <label className="f">{say('About you', 'आपके बारे में', 'Aapke baare mein')}</label>
          <textarea defaultValue={a.bio || a.skills.join(', ')} onBlur={(e) => mutate(() => { a.bio = e.target.value; })} />
          <label className="f">{say('Languages you work in', 'आप किन भाषाओं में काम करते हैं', 'Aap kin bhashaon mein kaam karte hain')}</label>
          <input type="text" defaultValue={(a.lang || []).join(', ')}
            onBlur={(e) => mutate(() => { a.lang = e.target.value.split(',').map((s) => s.trim()).filter(Boolean); })} />
          <label className="f">{say('Skills', 'कौशल', 'Kaushal')}</label>
          <div className="chips">{a.skills.map((s) => <span key={s} className="tag">{s}</span>)}</div>
          <button className="btn mt" onClick={() => toast('Saved.', 'ok')}>{say('Save changes', 'बदलाव सेव करें', 'Badlaav save karein')}</button>
        </div>
      </>
    );
  } else {
    // dashboard
    body = (
      <>
        <div className="between">
          <div>
            <h2 style={{ margin: 0 }}>{a.name}</h2>
            <p className="small muted" style={{ margin: '.15rem 0' }}>{a.cat || ''} · {a.city}</p>
            <div className="chips">{a.skills.slice(0, 3).map((s) => <span key={s} className="tag">{s}</span>)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <button className={'btn ' + (a.online ? 'go' : 'ghost')} onClick={() => mutate(() => { a.online = !a.online; })}>
              {a.online ? '● Online' : '○ Go online'}
            </button>
            <p className="tiny muted" style={{ margin: '.3rem 0 0' }}>
              {a.online ? say('Taking tasks', 'काम ले रहे हैं', 'Kaam le rahe hain') : say('No tasks coming in', 'कोई काम नहीं आएगा', 'Koi kaam nahi aayega')}
            </p>
          </div>
        </div>
        <div className="grid g4 mt">
          <div className="stat"><span className="small muted">{say('In queue', 'कतार में', 'Kataar mein')}</span><b style={open.length ? { color: 'var(--chilli)' } : undefined}>{open.length}</b></div>
          <div className="stat"><span className="small muted">{say('My active', 'मेरे चल रहे', 'Mere chal rahe')}</span><b>{active.length}</b></div>
          <div className="stat"><span className="small muted">{say('This week', 'इस हफ़्ते', 'Is hafte')}</span><b>{money(a.wk_earnings || 0)}</b></div>
          <div className="stat"><span className="small muted">{say('Pending payout', 'लंबित भुगतान', 'Lambhit bhugtan')}</span><b>{money(a.pending || 0)}</b></div>
          <div className="stat"><span className="small muted">Rating</span><b>{a.rating}★</b></div>
          <div className="stat"><span className="small muted">{say('Completed', 'पूरे किए', 'Poore kiye')}</span><b>{a.done}</b></div>
          <div className="stat"><span className="small muted">SLA</span><b style={{ fontSize: '1.1rem', paddingTop: '.3rem' }}>{a.sla}</b></div>
          <div className="stat"><span className="small muted">{say('Avg reply', 'औसत जवाब', 'Ausat jawab')}</span><b>{a.resp_min} min</b></div>
        </div>
        {open.length ? (
          <div className="urgentbox mt">
            <strong>{open.length} {say('task(s) waiting', 'काम प्रतीक्षा में', 'kaam waiting')}</strong>
            <QueueRows db={db} a={a} list={open.slice(0, 2)} />
          </div>
        ) : null}
        {active.length ? (
          <>
            <h3 className="sechead">{say('My active tasks', 'मेरे चल रहे काम', 'Mere chal rahe kaam')}</h3>
            <TaskRows db={db} a={a} list={active.slice(0, 3)} />
          </>
        ) : null}
        <h3 className="sechead">{say('Your economics', 'आपकी कमाई का गणित', 'Aapki kamai ka ganit')}</h3>
        <EconomicsBar customerPrice={120} commissionRate={cfg().commission.agent} label={say('You keep', 'आपको मिलता है', 'Aapko milta hai')} />
      </>
    );
  }

  return <AgentShell active={page}>{body}</AgentShell>;
}
