'use client';

/* Provider portal — 7 pages: dashboard, jobs, schedule, earnings, reviews,
   profile, verification. Ported 1:1 from the validated prototype. */

import Link from 'next/link';
import { ProviderShell } from '@/components/layout/Shell';
import { EconomicsBar } from '@/components/supply/EconomicsBar';
import { JobCard } from '@/components/supply/JobCard';
import { RatingHistogram } from '@/components/supply/RatingHistogram';
import { VerificationChecklist } from '@/components/supply/VerificationChecklist';
import { DemoFlag } from '@/components/ui/DemoFlag';
import { useDB } from '@/hooks/useDB';
import { setExecStage } from '@/lib/engine/tracker';
import { setStatus } from '@/lib/engine/taskEngine';
import { say } from '@/lib/i18n/useT';
import { cfg, money, mutate, notify, toast, track, when } from '@/lib/store';
import type { Booking, DBShape, Provider } from '@/lib/types';

function useProvider(): { db: DBShape | null; p: Provider | null } {
  const { db, ready } = useDB();
  if (!ready || !db) return { db: null, p: null };
  const p = db.providers.find((x) => x.id === db.session) || db.providers[0];
  return { db, p };
}

function acceptBooking(db: DBShape, b: Booking) {
  mutate(() => {
    b.status = 'Accepted';
    notify(b.userId, 'Your booking is accepted', 'The professional is scheduled.', 'info');
    setExecStage(b, 'accepted', 'Provider accepted');
  });
  toast('Accepted.', 'ok');
}
function declineBooking(_db: DBShape, b: Booking) {
  mutate(() => { b.status = 'Declined'; });
  toast('Declined.');
}
function startBooking(_db: DBShape, b: Booking) {
  mutate(() => {
    b.status = 'In progress';
    notify(b.userId, 'Your professional is on the way', 'Arriving in about 20 minutes.', 'info');
    setExecStage(b, 'on_way', 'Provider travelling');
  });
  toast('Customer notified.', 'ok');
}
function finishBooking(db: DBShape, b: Booking) {
  mutate(() => {
    b.status = 'Completed';
    setExecStage(b, 'working', 'Provider reported the work finished');
    const tt = db.tasks.find((x) => x.task_id === b.taskId);
    if (tt) setStatus(tt, 'In progress', 'Waiting for the customer to confirm');
    notify(b.userId, 'Job completed', 'Please rate the service.', 'info');
    track('provider_completed_job');
  });
  toast('Marked complete. Customer asked to rate.', 'ok');
}

export function ProviderPortal({ page }: { page: string }) {
  const { db, p } = useProvider();
  if (!db || !p) return <ProviderShell active={page}><div /></ProviderShell>;

  const jobs = db.bookings.filter((b) => b.providerId === p.id);
  const req = jobs.filter((b) => b.status === 'Requested');
  const live = jobs.filter((b) => ['Accepted', 'In progress'].includes(b.status));
  const done = jobs.filter((b) => b.status === 'Completed');
  const revs = db.reviews.filter((r) => r.providerId === p.id);
  const comm = cfg().commission.provider;
  const weekEarn = done.slice(-12).reduce((s, b) => s + b.price, 0) * (1 - comm);
  const todayEarn = done.slice(-3).reduce((s, b) => s + b.price, 0) * (1 - comm);

  const jobActions = {
    onAccept: (b: Booking) => acceptBooking(db, b),
    onDecline: (b: Booking) => declineBooking(db, b),
    onStart: (b: Booking) => startBooking(db, b),
    onDone: (b: Booking) => finishBooking(db, b),
  };

  let body: React.ReactNode = null;

  if (page === 'jobs') {
    const section = (list: Booking[], title: string) => list.length ? (
      <>
        <h3 className="sechead">{title}</h3>
        {list.map((b) => <JobCard key={b.id} b={b} actions {...jobActions} />)}
      </>
    ) : null;
    body = (
      <>
        <h2>{say('Your jobs', 'आपके काम', 'Aapke kaam')}</h2>
        <div className="filtrow">
          <button className="btn ghost sm on">{say('All', 'सब', 'Sab')}</button>
          <button className="btn ghost sm">{say('Requests', 'अनुरोध', 'Requests')}</button>
          <button className="btn ghost sm">{say('Active', 'चल रहे', 'Chal rahe')}</button>
          <button className="btn ghost sm">{say('Completed', 'पूरे', 'Poore')}</button>
        </div>
        {section(req, say('Needs your answer', 'जवाब दीजिए', 'Jawab dijiye'))}
        {section(live, say('In progress', 'चल रहे हैं', 'Chal rahe hain'))}
        {section(done.slice(-8), say('Completed', 'पूरे हुए काम', 'Poore hue kaam'))}
        {!req.length && !live.length && !done.length ? (
          <div className="card center muted">
            {say('No jobs yet. Switch to "Accepting jobs" on the dashboard.', 'अभी कोई काम नहीं। Dashboard पर "काम ले रहे हैं" चालू कीजिए।', 'Abhi koi kaam nahi. Dashboard par "jobs le rahe hain" on kijiye.')}
          </div>
        ) : null}
      </>
    );
  } else if (page === 'calendar') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayHi = ['सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'रवि'];
    body = (
      <>
        <h2>{say('Your schedule', 'आपका शेड्यूल', 'Aapka schedule')}</h2>
        <p className="muted small">{say('Set when you are available. Requests only come in when you are open.', 'कब उपलब्ध हैं, यह सेट करिए। अनुरोध तभी आएंगे।', 'Kab available hain, ye set kariye. Request tabhi aayenge.')}</p>
        <div className="calgrid">
          {days.map((d2, i) => {
            const slots = (p.avail || {})[d2] || [];
            return (
              <div key={d2} className={'calday' + (slots.length ? '' : ' closed')}>
                <strong>{say(d2, dayHi[i], d2)}</strong>
                {slots.length
                  ? slots.map((s) => <span key={s} className="slot">{s}</span>)
                  : <span className="small muted">{say('Closed', 'बंद', 'Band')}</span>}
                <button className="linkish tiny" onClick={() => toast('Not wired in this demo build.')}>{say('Edit', 'बदलें', 'Badlein')}</button>
              </div>
            );
          })}
        </div>
        <div className="card mt">
          <div className="between">
            <div>
              <strong>{say('Block a date', 'तारीख बंद करें', 'Tarikh band karein')}</strong>
              <p className="small muted" style={{ margin: '.2rem 0 0' }}>
                {say('Going somewhere? Block it so no new requests arrive.', 'कहीं जा रहे हैं? उस दिन के लिए अनुरोध बंद कर दें।', 'Kahin ja rahe hain? Us din ke liye request band kar dein.')}
              </p>
            </div>
            <button className="btn ghost sm" onClick={() => toast('Not wired in this demo build.')}>{say('Block a day', 'एक दिन बंद करें', 'Ek din band karein')}</button>
          </div>
        </div>
      </>
    );
  } else if (page === 'earnings') {
    const total = p.jobs * p.base * (1 - comm);
    const thisMonth = Math.round(weekEarn * 4);
    body = (
      <>
        <h2>{say('Earnings', 'कमाई', 'Kamai')}</h2>
        <div className="grid g3">
          <div className="stat"><span className="small muted">{say('Lifetime earned', 'कुल कमाई', 'Kul kamai')}</span><b>{money(Math.round(total))}</b></div>
          <div className="stat"><span className="small muted">{say('This month', 'इस महीने', 'Is mahine')}</span><b>{money(thisMonth)}</b></div>
          <div className="stat"><span className="small muted">{say('This week', 'इस हफ़्ते', 'Is hafte')}</span><b>{money(Math.round(weekEarn))}</b></div>
          <div className="stat"><span className="small muted">{say('Jobs done', 'काम पूरे', 'Kaam poore')}</span><b>{p.jobs}</b></div>
          <div className="stat"><span className="small muted">{say('Cancelled', 'रद्द', 'Radd')}</span><b>{p.cancelled || 0}</b></div>
          <div className="stat"><span className="small muted">{say('Disputes', 'विवाद', 'Vivaad')}</span><b>{p.disputes || 0}</b></div>
        </div>
        <h3 className="sechead">{say('How it splits', 'बँटवारा', 'Bantwara')}</h3>
        <EconomicsBar customerPrice={p.base} commissionRate={comm} />
        <h3 className="sechead">{say('Payment account', 'भुगतान खाता', 'Bhugtan khaata')}</h3>
        <div className="card">
          <div className="between">
            <div>
              <strong>{p.bank || '—'}</strong>
              <p className="small muted" style={{ margin: '.2rem 0 0' }}>
                {say('Weekly payout every Tuesday. Minimum withdrawal ₹200.', 'हर मंगलवार को भुगतान। न्यूनतम ₹200।', 'Har Mangalwar ko payment. Minimum ₹200.')}
              </p>
            </div>
            <DemoFlag>Bank transfer — integration required</DemoFlag>
          </div>
        </div>
        <h3 className="sechead">{say('How to earn more', 'ज़्यादा कमाने के तरीके', 'Zyada kamane ke tarike')}</h3>
        <div className="grid g2">
          <div className="card">
            <strong>{say('Reply faster', 'जल्दी जवाब दें', 'Jaldi jawab dein')}</strong>
            <p className="small muted">
              {say('Your avg reply time is ' + p.resp + ' min. Partners with under 8 min get 40% more jobs.',
                   'आपका औसत जवाब ' + p.resp + ' मिनट है। 8 मिनट के अंदर देने वालों को 40% ज़्यादा काम मिलता है।',
                   'Aapka average jawab ' + p.resp + ' min hai. 8 min ke andar dene walon ko 40% zyada kaam milta hai.')}
            </p>
          </div>
          <div className="card">
            <strong>{say('Complete more jobs', 'ज़्यादा काम पूरे करें', 'Zyada kaam poore karein')}</strong>
            <p className="small muted">
              {say('Completion rate: ' + Math.round(p.completion * 100) + '%. Reaching 95% unlocks "Top Rated" and a 10% higher base price.',
                   'पूरा करने का दर: ' + Math.round(p.completion * 100) + '%। 95% पर "टॉप रेटेड" और 10% ज़्यादा बेस प्राइस।',
                   'Completion rate: ' + Math.round(p.completion * 100) + '%. 95% par "Top Rated" aur 10% zyada base price.')}
            </p>
          </div>
        </div>
      </>
    );
  } else if (page === 'reviews') {
    body = (
      <>
        <h2>{say('Reviews', 'समीक्षाएँ', 'Reviews')}</h2>
        <div className="grid g2 mt">
          <div className="card center">
            <div style={{ fontSize: '3rem', fontFamily: '"Baloo 2"', lineHeight: 1 }}>{p.rating}</div>
            <div>{'★'.repeat(Math.round(p.rating))}{'☆'.repeat(5 - Math.round(p.rating))}</div>
            <div className="small muted">{p.reviews_count} {say('reviews', 'समीक्षाएँ', 'reviews')}</div>
          </div>
          <RatingHistogram hist={p.rating_hist || {}} />
        </div>
        <div className="mt">
          {revs.length ? revs.map((r) => {
            const ru = db.users.find((x) => x.id === r.userId) || { name: 'Customer' };
            return (
              <div key={r.id} className="card mb">
                <div className="between">
                  <div><strong>{ru.name}</strong> <span>{'★'.repeat(r.stars)}</span></div>
                  <span className="tiny muted">{when(r.at)}</span>
                </div>
                <p className="small" style={{ margin: '.3rem 0 0' }}>{r.text}</p>
              </div>
            );
          }) : (
            <div className="card muted">
              {say('No reviews yet. Finish a few jobs and ask for a rating.', 'अभी कोई समीक्षा नहीं। काम पूरे करें और रेटिंग माँगें।', 'Abhi koi review nahi. Kaam poore karein aur rating maangein.')}
            </div>
          )}
        </div>
      </>
    );
  } else if (page === 'profile') {
    body = (
      <>
        <h2>{say('Your profile', 'आपकी प्रोफ़ाइल', 'Aapki profile')}</h2>
        <div className="card pad">
          <div className="grid g2">
            <div>
              <label className="f">{say('Business name', 'व्यवसाय का नाम', 'Business ka naam')}</label>
              <input type="text" defaultValue={p.name} onBlur={(e) => mutate(() => { p.name = e.target.value || p.name; })} />
              <label className="f">{say('Service', 'सेवा', 'Seva')}</label>
              <input type="text" defaultValue={p.cat} disabled />
              <label className="f">{say('About you (shown to customers)', 'आपके बारे में (ग्राहकों को दिखेगा)', 'Aapke baare mein (customers ko dikhega)')}</label>
              <textarea defaultValue={p.bio || ''} onBlur={(e) => mutate(() => { p.bio = e.target.value; })} />
            </div>
            <div>
              <label className="f">{say('Starting price', 'शुरुआती कीमत', 'Shurwaati keemat')} (₹)</label>
              <input type="number" defaultValue={p.base} onBlur={(e) => mutate(() => { p.base = +e.target.value || p.base; })} />
              <label className="f">{say('Hourly rate (if you charge by hour)', 'प्रति घंटा (अगर घंटे से लेते हैं)', 'Per hour (agar ghante se lete hain)')} (₹)</label>
              <input type="number" defaultValue={p.hourly || 0} onBlur={(e) => mutate(() => { p.hourly = +e.target.value || 0; })} />
              <label className="f">{say('Service radius', 'सेवा क्षेत्र', 'Seva kshetra')} (km)</label>
              <input type="number" defaultValue={p.radius} onBlur={(e) => mutate(() => { p.radius = +e.target.value || p.radius; })} />
              <label className="f">{say('Languages', 'भाषाएँ', 'Bhashayein')}</label>
              <input type="text" defaultValue={(p.lang || []).join(', ')}
                onBlur={(e) => mutate(() => { p.lang = e.target.value.split(',').map((s) => s.trim()).filter(Boolean); })} />
            </div>
          </div>
          <button className="btn mt" onClick={() => toast('Saved.', 'ok')}>{say('Save changes', 'बदलाव सेव करें', 'Badlaav save karein')}</button>
        </div>
        <h3 className="sechead">{say('Your economics', 'आपकी कमाई का गणित', 'Aapki kamai ka ganit')}</h3>
        <EconomicsBar customerPrice={p.base} commissionRate={comm} />
      </>
    );
  } else if (page === 'verify') {
    const items = [
      { k: 'aadhaar', en: 'Aadhaar card', hi: 'आधार कार्ड', hin: 'Aadhaar card', done: !!p.aadhaar },
      { k: 'pan', en: 'PAN card', hi: 'पैन कार्ड', hin: 'PAN card', done: !!p.pan },
      { k: 'address_proof', en: 'Address proof', hi: 'पते का प्रमाण', hin: 'Address proof', done: !!p.address_proof },
      { k: 'skill_cert', en: 'Skill certificate', hi: 'कौशल प्रमाणपत्र', hin: 'Skill certificate', done: !!p.skill_cert },
      { k: 'police', en: 'Police verification', hi: 'पुलिस जाँच', hin: 'Police verification', done: !!p.police },
    ];
    const doneCount = items.filter((i) => i.done).length;
    const shield = doneCount === items.length ? '🛡️ Fully verified' : doneCount >= 3 ? '🔰 Mostly verified' : '⚠️ Verification incomplete';
    const shieldC = doneCount === items.length ? 'go' : doneCount >= 3 ? 'warn' : 'stop';
    body = (
      <>
        <h2>{say('Verification', 'सत्यापन', 'Verification')}</h2>
        <div className="card" style={{ borderWidth: 2, borderColor: doneCount === items.length ? 'var(--leaf)' : 'var(--marigold)' }}>
          <div className="between">
            <span className={'tag ' + shieldC}>{shield}</span>
            <span className={'tag ' + (p.status === 'Verified' ? 'go' : p.status === 'Under verification' ? 'warm' : 'stop')}>{p.status}</span>
          </div>
          <p className="small muted" style={{ margin: '.5rem 0 0' }}>
            {say('Higher verification = more customers, higher trust, top placement.', 'ज़्यादा सत्यापन = ज़्यादा ग्राहक, ज़्यादा भरोसा, ऊपर की जगह।', 'Zyada verification = zyada customers, zyada trust, upar ki jagah.')}
          </p>
        </div>
        <VerificationChecklist items={items} />
        <div className="card mt">
          <div className="between">
            <div>
              <strong>{say('Police verification', 'पुलिस जाँच', 'Police jaanch')}</strong>
              <p className="small muted" style={{ margin: '.2rem 0 0' }}>
                {say('Required for home services. Once cleared, you get a Police Verified badge and higher customer trust.', 'घर की सेवाओं के लिए ज़रूरी। बैज मिलने पर ज़्यादा ग्राहक।', 'Ghar ki services ke liye zaroori. Badge milne par zyada customers.')}
              </p>
            </div>
            {p.police ? <span className="tag go">✓ Cleared</span> : <button className="btn ghost sm" onClick={() => toast('Not wired in this demo build.')}>Start process</button>}
          </div>
        </div>
      </>
    );
  } else {
    // dashboard
    body = (
      <>
        <div className="between">
          <div>
            <h2 style={{ margin: 0 }}>{p.name}</h2>
            <p className="small muted" style={{ margin: '.15rem 0' }}>{p.cat} · {p.locality}, {p.city}</p>
            <div className="chips">{(p.badges || []).map((b) => <span key={b} className="tag go">{b}</span>)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <button className={'btn ' + (p.open ? 'go' : 'ghost')} onClick={() => {
              const next = !p.open;
              mutate(() => { p.open = next; });
              toast(next ? 'You are accepting jobs.' : 'You are offline.');
            }}>
              {p.open ? say('● Accepting jobs', '● काम ले रहे हैं', '● Jobs le rahe hain') : say('○ Not accepting', '○ बंद', '○ Band')}
            </button>
            <p className="tiny muted" style={{ margin: '.3rem 0 0' }}>{say('Tap to switch', 'बदलने के लिए दबाइए', 'Badlne ke liye dabaiye')}</p>
          </div>
        </div>
        <div className="grid g4 mt">
          <div className="stat"><span className="small muted">{say('New requests', 'नए अनुरोध', 'Naye request')}</span><b style={req.length ? { color: 'var(--chilli)' } : undefined}>{req.length}</b></div>
          <div className="stat"><span className="small muted">{say('Live jobs', 'चल रहे काम', 'Chal rahe kaam')}</span><b>{live.length}</b></div>
          <div className="stat"><span className="small muted">{say('Today earning', 'आज की कमाई', 'Aaj ki kamai')}</span><b>{money(todayEarn)}</b></div>
          <div className="stat"><span className="small muted">{say('This week', 'इस हफ़्ते', 'Is hafte')}</span><b>{money(weekEarn)}</b></div>
          <div className="stat"><span className="small muted">{say('Rating', 'रेटिंग', 'Rating')}</span><b>{p.rating}★</b></div>
          <div className="stat"><span className="small muted">{say('Jobs done', 'काम पूरे', 'Kaam poore')}</span><b>{p.jobs}</b></div>
          <div className="stat"><span className="small muted">{say('Completion', 'पूरा करने का %', 'Poora karne ka %')}</span><b>{Math.round(p.completion * 100)}%</b></div>
          <div className="stat"><span className="small muted">{say('Response time', 'जवाब का समय', 'Jawab ka samay')}</span><b>{p.resp} min</b></div>
        </div>
        {req.length ? (
          <div className="urgentbox mt">
            <strong>
              {say(`${req.length} new request${req.length > 1 ? 's' : ''} need your answer`, `${req.length} नए अनुरोध जवाब माँग रहे हैं`, `${req.length} naye requests jawab maang rahe hain`)}
            </strong>
            {req.slice(0, 2).map((b) => <JobCard key={b.id} b={b} actions {...jobActions} />)}
            {req.length > 2 ? <Link className="linkish small" href="/provider/jobs">{say('See all', 'सब देखिए', 'Sab dekhiye')}</Link> : null}
          </div>
        ) : null}
        {live.length ? (
          <>
            <h3 className="sechead">{say('Live now', 'अभी चल रहा', 'Abhi chal raha')}</h3>
            {live.slice(0, 2).map((b) => <JobCard key={b.id} b={b} actions {...jobActions} />)}
          </>
        ) : null}
        <h3 className="sechead">{say('How the money works', 'पैसे कैसे बँटते हैं', 'Paise kaise baante hain')}</h3>
        <EconomicsBar customerPrice={p.base} commissionRate={comm} />
      </>
    );
  }

  return <ProviderShell active={page}>{body}</ProviderShell>;
}
