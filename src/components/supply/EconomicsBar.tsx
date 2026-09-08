'use client';

/* Customer price / platform fee / you-keep split — shown before every job.
   Commission rate is live from admin config, so a change propagates
   everywhere without a deploy. Product rule 10: never hidden. */

import { money } from '@/lib/store';
import { say } from '@/lib/i18n/useT';

export function EconomicsBar({ customerPrice, commissionRate, label }: {
  customerPrice: number; commissionRate: number; label?: string;
}) {
  const fee = Math.round(customerPrice * commissionRate);
  const earn = customerPrice - fee;
  const pct = Math.round(commissionRate * 100);
  return (
    <div className="econ">
      <div className="econrow"><span>{say('Customer pays', 'ग्राहक देगा', 'Grahak dega')}</span><strong>{money(customerPrice)}</strong></div>
      <div className="econrow fee"><span>{say('Platform fee', 'प्लेटफ़ॉर्म शुल्क', 'Platform shulk')} ({pct}%)</span><span>−{money(fee)}</span></div>
      <div className="econrow earn"><span>{label || say('You keep', 'आपको मिलेगा', 'Aapko milega')}</span><strong>{money(earn)}</strong></div>
      <div className="econbar"><span style={{ width: 100 - pct + '%' }} /></div>
      <p className="tiny muted" style={{ margin: 0 }}>
        {say('Commission is shown before every job. No hidden cuts.', 'हर काम से पहले कमीशन दिखता है। कोई छुपी कटौती नहीं।', 'Har kaam se pehle commission dikhta hai. Koi chhupa cut nahi.')}
      </p>
    </div>
  );
}
