'use client';

/* Live operator metrics — how many people have actually signed up, how
   much of the supply side is live, and what still needs an approval. Pulled
   from Supabase (owner-only, RLS-enforced) so the numbers are real growth,
   not whatever happens to be seeded into this one browser. */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { authConfigured } from '@/lib/auth/supabase';
import { fetchMarketplaceCounts } from '@/lib/sync/marketplace';
import { fetchAllApplications, fetchAllRequests } from '@/lib/sync/requests';
import { fetchAllProfiles } from '@/lib/sync/adminUsers';
import { cfg, money } from '@/lib/store';

export function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    users: number; mrr: number; providers: number; agents: number;
    pendingApps: number; openRequests: number; totalRequests: number;
  } | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [profiles, apps, reqs, market] = await Promise.all([
      fetchAllProfiles(), fetchAllApplications(), fetchAllRequests(), fetchMarketplaceCounts(),
    ]);
    if (profiles) {
      const plans = cfg().plans;
      const mrr = profiles.reduce((s, p) => s + (plans.find((pl) => pl.id === p.plan)?.price || 0), 0);
      setStats({
        users: profiles.length,
        mrr,
        providers: market?.providers ?? 0,
        agents: market?.agents ?? 0,
        pendingApps: (apps || []).filter((a) => a.status !== 'verified' && a.status !== 'rejected').length,
        openRequests: (reqs || []).filter((r) => !['Completed', 'Cancelled', 'Failed', 'Refunded'].includes(r.status)).length,
        totalRequests: (reqs || []).length,
      });
    } else {
      setStats(null);
    }
    setLoading(false);
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  if (!authConfigured()) {
    return <div className="card muted">Connect Supabase to see live numbers here (docs/SUPABASE.md).</div>;
  }
  if (loading) return <div className="card muted">Loading live numbers…</div>;
  if (!stats) return <div className="card muted">Could not load (are you signed in as an owner account?).</div>;

  return (
    <>
      <div className="between">
        <h3 className="sechead" style={{ marginTop: 0 }}>Live on the platform</h3>
        <button className="btn ghost sm" onClick={() => void refresh()}>↻ Refresh</button>
      </div>
      <div className="grid g4">
        <div className="stat"><span className="small muted">Signed-up users</span><b>{stats.users}</b></div>
        <div className="stat"><span className="small muted">Live service partners</span><b>{stats.providers}</b></div>
        <div className="stat"><span className="small muted">Live digital agents</span><b>{stats.agents}</b></div>
        <div className="stat">
          <span className="small muted">Needs approval</span>
          <b style={stats.pendingApps ? { color: 'var(--chilli)' } : undefined}>{stats.pendingApps}</b>
        </div>
        <div className="stat"><span className="small muted">Subscription revenue / month</span><b>{money(stats.mrr)}</b></div>
        <div className="stat"><span className="small muted">Open service requests</span><b>{stats.openRequests}</b></div>
        <div className="stat"><span className="small muted">Total requests ever</span><b>{stats.totalRequests}</b></div>
      </div>
      {stats.pendingApps ? (
        <p className="small mt">
          <Link className="linkish" href="/admin/requests">→ {stats.pendingApps} application{stats.pendingApps > 1 ? 's' : ''} waiting in the Requests inbox</Link>
        </p>
      ) : null}
    </>
  );
}
