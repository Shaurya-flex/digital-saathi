'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
function LangSwitch() {
  const { lang, ready } = useSiteLang();
  const pick = (l: 'en' | 'hinglish') => {
    setSiteLang(l);
    const db = getDB();
    const u = db.users.find((x) => x.id === db.session);
    if (u && u.role === 'customer') mutate(() => { u.lang = l; });
  };
  return (
    <div className="langswitch" role="group" aria-label="Site language">
      <button className={ready && lang === 'en' ? 'on' : ''} onClick={() => pick('en')}>EN</button>
      <button className={ready && lang === 'hinglish' ? 'on' : ''} onClick={() => pick('hinglish')}>Hinglish</button>
    </div>
  );
}

export function Header() {
  const { user, ready } = useSession();
  const { unread } = useNotifications();
  const path = usePathname() || '/';
  const router = useRouter();
  const pub = !user || path === '/' || path.startsWith('/learn') || path.startsWith('/partner')
    || path.startsWith('/become-agent') || path.startsWith('/network') || path.startsWith('/terms') || path.startsWith('/privacy');
  const on = (p: string) => (path === p || (p !== '/' && path.startsWith(p)) ? 'on' : '');
  const onNetwork = path.startsWith('/network') || path.startsWith('/partner') || path.startsWith('/become-agent');
  return (
    <header className="top">
      <div className="wrap bar">
        <Link className="brand" href="/"><span className="mark">डि</span> Digital Saathi</Link>
        {pub ? (
          <nav className="mainnav">
            <Link href="/" className={path === '/' ? 'on' : ''}>Home</Link>
            <Link href="/pricing" className={on('/pricing')}>Pricing</Link>
            <Link href="/learn" className={on('/learn')}>Learn</Link>
            <Link href="/network" className={onNetwork ? 'on' : ''}>Partner with us</Link>
          </nav>
        ) : null}
        <div className="row">
          <LangSwitch />
          {ready && user ? (
            <>
              <button className="linkish small" onClick={() => router.push('/app/alerts')}>
                Alerts {unread ? <span className="tag stop">{unread}</span> : null}
              </button>
              <span className="tag plain">{user.name.split(' ')[0]} · {user.role}</span>
              <button className="btn ghost sm" onClick={() => {
                const real = getDB().mode === 'real';
                logout();
                if (real) void supaSignOut();
                router.push('/login' + (real ? '' : '?demo=1'));
              }}>{getDB().mode === 'real' ? 'Sign out' : 'Switch account'}</button>
            </>
          ) : (
            <>
              <Link className="btn ghost sm" href="/login">Sign in</Link>
              <Link className="btn sm" href="/login">Try Digital Saathi</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
