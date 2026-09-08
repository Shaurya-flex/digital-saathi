'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { useSession } from '@/hooks/useSession';

export type NavItem = [key: string, label: string, icon: string];

/* Which roles may open each portal. Operations pages (admin) and the supply
   portals are invisible to customers and the signed-out public — the shell
   silently redirects them home. */
const PORTAL_ROLES: Record<string, string[]> = {
  app: ['customer', 'admin'],
  provider: ['provider', 'admin'],
  agent: ['agent', 'admin'],
  admin: ['admin'],
};

/* Shared app shell: sticky sidebar nav + content. Redirects to /login when
   there is no session, and away when the role has no access to this portal. */
export function Shell({ nav, base, active, children }: {
  nav: NavItem[]; base: string; active: string; children: ReactNode;
}) {
  const { user, ready } = useSession();
  const router = useRouter();
  const allowed = !user ? false : (PORTAL_ROLES[base] || ['admin']).includes(user.role);
  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace('/login');
    else if (!allowed) router.replace(user.role === 'customer' ? '/app/ask' : '/');
  }, [ready, user, allowed, router]);
  if (!ready) return <main id="main" className="wrap appshell"><section /></main>;
  if (!user || !allowed) return null;
  return (
    <main id="main" className="wrap appshell">
      <aside className="side">
        {nav.map(([k, l, i]) => (
          <Link key={k} href={`/${base}/${k}`} className={active === k ? 'on' : ''}>
            <span aria-hidden="true">{i}</span> {l}
          </Link>
        ))}
      </aside>
      <section>{children}</section>
    </main>
  );
}

export const CUST_NAV: NavItem[] = [
  ['ask', 'Ask Saathi', '🎙️'], ['tasks', 'My Tasks', '🗂️'], ['bookings', 'Bookings', '📅'],
  ['family', 'Family', '👪'], ['documents', 'Documents', '🔒'], ['wallet', 'Wallet & Credits', '💳'],
  ['services', 'Services', '🛠️'], ['alerts', 'Alerts', '🔔'], ['profile', 'Profile', '⚙️'],
];
export const PROV_NAV: NavItem[] = [
  ['dash', 'Dashboard', '📊'], ['jobs', 'Jobs', '🔧'], ['calendar', 'Schedule', '📅'],
  ['earnings', 'Earnings', '💰'], ['reviews', 'Reviews', '⭐'], ['profile', 'Profile', '⚙️'], ['verify', 'Verification', '✅'],
];
export const AG_NAV: NavItem[] = [
  ['dash', 'Dashboard', '📊'], ['queue', 'Task queue', '📥'], ['assigned', 'My tasks', '🗂️'],
  ['earnings', 'Earnings', '💰'], ['performance', 'Performance', '📈'], ['profile', 'Profile', '⚙️'],
];
export const ADM_NAV: NavItem[] = [
  ['overview', 'Overview', '📊'], ['users', 'Users', '👥'], ['tasks', 'Tasks', '🗂️'], ['providers', 'Providers', '🔧'],
  ['agents', 'Agents', '🧑‍💼'], ['payments', 'Payments', '💳'], ['credits', 'Credits & pricing', '🎫'], ['services', 'Services', '🛠️'],
  ['disputes', 'Disputes', '⚖️'], ['analytics', 'Analytics', '📈'], ['integrations', 'Integrations', '🔌'], ['audit', 'Audit logs', '📜'],
];

export function CustomerShell({ active, children }: { active: string; children: ReactNode }) {
  return <Shell nav={CUST_NAV} base="app" active={active}>{children}</Shell>;
}
export function ProviderShell({ active, children }: { active: string; children: ReactNode }) {
  return <Shell nav={PROV_NAV} base="provider" active={active}>{children}</Shell>;
}
export function AgentShell({ active, children }: { active: string; children: ReactNode }) {
  return <Shell nav={AG_NAV} base="agent" active={active}>{children}</Shell>;
}
export function AdminShell({ active, children }: { active: string; children: ReactNode }) {
  return <Shell nav={ADM_NAV} base="admin" active={active}>{children}</Shell>;
}

// Convenience alias files re-export from here (CustomerShell.tsx etc.)
export function usePortalPage(fallback: string): string {
  const path = usePathname() || '';
  const seg = path.split('/').filter(Boolean)[1];
  return seg || fallback;
}
