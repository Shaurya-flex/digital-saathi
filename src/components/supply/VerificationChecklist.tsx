'use client';

/* Verification checklist with status badges and upload placeholders.
   Providers must be verified before their first job. */

import { DemoFlag } from '@/components/ui/DemoFlag';
import { say } from '@/lib/i18n/useT';

export interface VerifyItem { k: string; en: string; hi: string; hin: string; done: boolean | string }

export function VerificationChecklist({ items }: { items: VerifyItem[] }) {
  return (
    <div className="grid g2 mt">
      {items.map((i) => {
        const ok = i.done === true || i.done === 'passed';
        const pending = i.done === 'pending';
        return (
          <div key={i.k} className="card">
            <div className="between">
              <div>
                <strong>{say(i.en, i.hi, i.hin)}</strong>
                <div className="small muted">
                  {ok ? say('Submitted and checked', 'जमा और जाँचा गया', 'Jama aur jaancha gaya')
                      : say('Not yet submitted', 'अभी जमा नहीं', 'Abhi jama nahi')}
                </div>
              </div>
              <span className={'tag ' + (ok ? 'go' : pending ? 'warn' : 'plain')}>
                {ok ? '✓ ' + say('Done', 'हो गया', 'Ho gaya') : pending ? 'Pending' : 'Not started'}
              </span>
            </div>
            {!ok ? (
              <div className="between card" style={{ padding: '.5rem', marginTop: '.5rem', background: '#f9f8f5' }}>
                <span className="small muted">{say('Upload', 'अपलोड करें', 'Upload karein')}</span>
                <DemoFlag>Storage integration required</DemoFlag>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
