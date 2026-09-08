/* Owner + launch configuration.

   OWNER emails (NEXT_PUBLIC_OWNER_EMAILS, comma-separated) get the admin
   role on Google sign-in; everyone else is a customer. The admin, agent and
   provider portals are role-gated in the shell, so operations pages —
   margins, commissions, pricing controls, audit — are invisible to the
   public. The demo sandbox with fabricated personas only exists in local
   development (or when NEXT_PUBLIC_ENABLE_DEMO=1 is set explicitly). */

export const OWNER_EMAILS: string[] = (process.env.NEXT_PUBLIC_OWNER_EMAILS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export const isOwnerEmail = (email?: string | null) =>
  !!email && OWNER_EMAILS.includes(email.toLowerCase());

export const demoAllowed = () =>
  process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_DEMO === '1';

/** Launch metros — where doorstep services and payments go live first. */
export const METRO_CITIES = [
  'Delhi NCR', 'Mumbai', 'Bengaluru', 'Hyderabad',
  'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
] as const;
