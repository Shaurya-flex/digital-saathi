/* Adapter registry. Each adapter is the ONLY place that talks to the outside
   world for its service — swap a body for a real API call and nothing else
   in the app changes. The admin Integrations page renders this table. */
import { llm } from './llm';
import { stt } from './stt';
import { tts } from './tts';
import { search } from './search';
import { browser } from './browser';
import { recharge } from './recharge';
import { bills } from './bills';
import { travel } from './travel';
import { appointments } from './appointments';
import { maps } from './maps';
import { payments } from './payments';
import { storage } from './storage';
import { sms } from './sms';
import { whatsapp } from './whatsapp';
import { email } from './email';
import { analytics } from './analytics';

export const ADAPTERS = {
  llm, stt, tts, search, browser, recharge, bills, travel,
  appointments, maps, payments, storage, sms, whatsapp, email, analytics,
} as const;

export type AdapterKey = keyof typeof ADAPTERS;
export { llm, stt, tts, search, browser, recharge, bills, travel, appointments, maps, payments, storage, sms, whatsapp, email, analytics };
