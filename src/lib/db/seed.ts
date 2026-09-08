/* Seed the real database from the same demo dataset the client store uses:
   18 providers, 6 agents, 3 customer accounts + supporting rows.
   Run with: npm run db:seed  (requires DATABASE_URL)                     */

import { SEED } from '../seed';
import { db } from './client';
import {
  agents, bookings, documents, familyMembers, notifications, planConfigs,
  pricingRules, profiles, providers, reviews, users,
} from './schema';

const toPaise = (rupees: number | undefined) => Math.round((rupees || 0) * 100);

async function main() {
  const d = db();
  const seed = SEED();

  await d.insert(users).values(seed.users.map((u) => ({
    id: u.id, name: u.name, phone: u.phone || null, role: u.role, lang: u.lang,
    planId: u.plan || null, credits: u.credits || 0,
    walletPaise: toPaise(u.wallet), easyMode: !!u.easy,
  }))).onConflictDoNothing();

  await d.insert(profiles).values(seed.users.map((u) => ({
    userId: u.id, city: u.city, memory: u.memory || {}, avatar: u.avatar || null,
  }))).onConflictDoNothing();

  await d.insert(familyMembers).values(seed.family.map((f) => ({
    id: f.id, ownerId: f.ownerId, linkedUserId: f.linkedUserId || null,
    name: f.name, relation: f.relation, phone: f.phone,
    permissions: f.perms as unknown as Record<string, boolean>,
  }))).onConflictDoNothing();

  await d.insert(providers).values(seed.providers.map((p) => ({
    id: p.id, name: p.name, owner: p.owner || null, phone: p.phone || null,
    city: p.city, locality: p.locality, cat: p.cat, bio: p.bio || null,
    expYears: p.exp || 0, lang: p.lang || [], rating: p.rating, jobsDone: p.jobs,
    radiusKm: p.radius, etaMin: p.eta, basePricePaise: toPaise(p.base),
    hourlyPaise: toPaise(p.hourly), status: p.status,
    completionRate: p.completion, responseMin: p.resp,
    availability: p.avail || {}, reviewsCount: p.reviews_count || 0,
    ratingHist: (p.rating_hist || {}) as unknown as Record<string, number>,
    cancelled: p.cancelled || 0, disputes: p.disputes || 0,
    bankLabel: p.bank || null, payoutCycle: p.payout_cycle || 'weekly', open: p.open,
  }))).onConflictDoNothing();

  await d.insert(agents).values(seed.agents.map((a) => ({
    id: a.id, name: a.name, phone: a.phone || null, city: a.city,
    lang: a.lang, cat: a.cat || null, bio: a.bio || null, skills: a.skills,
    rating: a.rating, done: a.done, cancel: a.cancel || 0, dispute: a.dispute || 0,
    sla: a.sla, respMin: a.resp_min || null,
    earningsPaise: toPaise(a.earnings), pendingPaise: toPaise(a.pending),
    verified: !!a.verified, level: a.level || 'New', status: a.status || 'Active',
    online: a.online,
  }))).onConflictDoNothing();

  await d.insert(documents).values(seed.documents.map((doc) => ({
    id: doc.id, userId: doc.userId, name: doc.name, category: doc.cat,
    sizeBytes: 0, storageKey: null, expiryDate: doc.expiry || null, summary: doc.summary,
  }))).onConflictDoNothing();

  await d.insert(bookings).values(seed.bookings.map((b) => ({
    id: b.id, taskId: b.taskId, userId: b.userId, providerId: b.providerId,
    category: b.cat, scheduledFor: b.when, address: b.address,
    status: b.status, pricePaise: toPaise(b.price),
  }))).onConflictDoNothing();

  await d.insert(reviews).values(seed.reviews.map((r) => ({
    id: r.id, userId: r.userId, providerId: r.providerId, taskId: r.taskId || null,
    stars: r.stars, text: r.text,
  }))).onConflictDoNothing();

  await d.insert(notifications).values(seed.notifications.map((n) => ({
    id: n.id, userId: n.userId, title: n.title, body: n.body, kind: n.kind, read: n.read,
  }))).onConflictDoNothing();

  await d.insert(pricingRules).values(Object.entries(seed.config.pricing).map(([intent, credits], i) => ({
    id: 'pr_' + String(i).padStart(3, '0'), intent, credits,
  }))).onConflictDoNothing();

  await d.insert(planConfigs).values(seed.config.plans.map((p) => ({
    id: 'plan_' + p.id, planKey: p.id, name: p.name,
    pricePaise: toPaise(p.price), credits: p.credits, seats: p.seats, perks: p.perks,
  }))).onConflictDoNothing();

  console.log('Seeded: %d users, %d providers, %d agents',
    seed.users.length, seed.providers.length, seed.agents.length);
}

main().catch((e) => { console.error(e); process.exit(1); });
