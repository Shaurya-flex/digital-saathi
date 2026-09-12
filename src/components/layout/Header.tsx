'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from '@/hooks/useSession';
import { useNotifications } from '@/hooks/useNotifications';
import { useSiteLang } from '@/hooks/useSiteLang';
import { logout } from '@/lib/auth/session';
import { supaSignOut } from '@/lib/auth/supabase';
import { setSiteLang } from '@/lib/i18n/siteLang';
import { getDB, mutate } from '@/lib/store';

/** EN / Hinglish — always visible. For a signed-in customer it also flips
    their in-app language field, so the two stay in sync; the full
    12-language picker in Profile still covers everything else. */
function LangSwitch({ className = '' }: { className?: string }) {
  const { lang, ready } = useSiteLang();
  const pick = (l: 'en' | 'hinglish') => {
    setSiteLang(l);
    const db = getDB();
    const u = db.users.find((x) => x.id === db.session);
    if (u && u.role === 'customer') mutate(() => { u.lang = l; });
  };
  return (
    <div className={'langswitch ' + className} role="group" aria-label="Site language">
      <button className={ready && lang === 'en' ? 'on' : ''} onClick={() => pick('en')}>EN</button>
      <button className={ready && lang === 'hinglish' ? 'on' : ''} onClick={() => pick('hinglish')}>Hinglish</button>
    </div>
  );
}

/* One header for every screen. On phones the links and account actions
   fold into a menu under the bar (☰), so nothing wraps or gets cut off and
   every option a desktop user has is one tap away. */
export function Header() {
  const { user, ready } = useSession();
  const { unread } = useNotifications();
  const path = usePathname() || '/';
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [path]);

  const pub = !user || path === '/' || ['/services', '/pricing', '/audit', '/learn', '/partner', '/become-agent', '/network', '/terms', '/privacy']
    .some((p) => path.startsWith(p));
  const on = (p: string) => (path === p || (p !== '/' && path.startsWith(p)) ? 'on' : '');
  const real = ready ? getDB().mode === 'real' : false;
  const { t } = useSiteLang();

  return (
    <header className={'top' + (open ? ' open' : '')}>
      <div className="wrap bar">
        <Link className="brand" href="/"><span className="mark">डि</span> Digital Saathi</Link>
        <div className="barright">
          <LangSwitch className="mobileonly" />
          <button className="menubtn" aria-expanded={open} aria-controls="sitemenu" aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}>
            {open ? '✕' : '☰'}
          </button>
        </div>
        <div className="menu" id="sitemenu">
          {pub ? (
            <nav className="mainnav" aria-label="Main">
              <Link href="/services" className={on('/services')}>Services</Link>
              <Link href="/pricing" className={on('/pricing')}>Pricing</Link>
              <Link href="/learn" className={on('/learn')}>{t('Learn', 'Seekhiye')}</Link>
            </nav>
          ) : null}
          <div className="actions">
            <LangSwitch className="desktoponly" />
            {ready && user ? (
              <>
                {user.role === 'admin' ? <Link className="btn ghost sm" href="/admin/leads">Admin desk</Link>
                  : user.role === 'provider' ? <Link className="btn ghost sm" href="/provider/dash">Partner desk</Link>
                  : user.role === 'agent' ? <Link className="btn ghost sm" href="/agent/dash">Agent desk</Link>
                  : null}
                <button className="linkish small" onClick={() => router.push('/app/alerts')}>
                  Alerts {unread ? <span className="tag stop">{unread}</span> : null}
                </button>
                <span className="tag plain">{user.name.split(' ')[0]} · {user.role}</span>
                <button className="btn ghost sm" onClick={() => {
                  logout();
                  if (real) void supaSignOut();
                  router.push('/login' + (real ? '' : '?demo=1'));
                }}>{real ? 'Sign out' : 'Switch account'}</button>
              </>
            ) : (
              <>
                <Link className="btn ghost sm" href="/login">Log in</Link>
                <Link className="btn warm sm" href="/audit">{t('Free audit', 'Free audit')}</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
