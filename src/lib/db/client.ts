import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

/* Neon serverless Postgres connection. Server-side only — import this from
   API routes and scripts, never from client components. When DATABASE_URL is
   absent the app runs in demo mode and this module is simply never called. */

export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. The app runs in demo mode without it; set it (Neon connection string) to use the database.',
    );
  }
  return drizzle(neon(url), { schema });
}

export { schema };
