'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { useNotifications } from '@/hooks/useNotifications';
import { logout } from '@/lib/auth/session';

export function Header() {
  const { user, ready } = useSession();
  const { unread } = useNotifications();
  const path = usePathname() || '/';
  const router = useRouter();
  const pub = !user || path === '/' || path.startsWith('/learn') || path.startsWith('/partner') || path.startsWith('/become-agent');
  const on = (p: string) => (path === p || (p !== '/' && path.startsWith(p)) ? 'on' : '');
  return (
    <header className="top">
      <div className="wrap bar">
        <Link className="brand" href="/"><span className="mark">डि</span> Digital Saathi</Link>
        {pub ? (
          <nav className="mainnav">
            <Link href="/" className={path === '/' ? 'on' : ''}>Home</Link>
            <Link href="/#pricing">Pricing</Link>
            <Link href="/learn" className={on('/learn')}>Learn</Link>
            <Link href="/partner" className={on('/partner')}>Service partner</Link>
            <Link href="/become-agent" className={on('/become-agent')}>Digital agent</Link>
          </nav>
        ) : null}
        <div className="row">
          {ready && user ? (
            <>
              <button className="linkish small" onClick={() => router.push('/app/alerts')}>
                Alerts {unread ? <span className="tag stop">{unread}</span> : null}
              </button>
              <span className="tag plain">{user.name.split(' ')[0]} · {user.role}</span>
              <button className="btn ghost sm" onClick={() => { logout(); router.push('/login'); }}>Switch account</button>
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
