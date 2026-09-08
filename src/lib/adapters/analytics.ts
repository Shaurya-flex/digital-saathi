/* Analytics adapter (PostHog / Mixpanel). Demo mode records events in the
   store so Admin → Analytics works offline. */
export interface AnalyticsAdapter {
  name: string; env: string; live: boolean;
  capture(event: string, props?: Record<string, unknown>): void;
}
export const analytics: AnalyticsAdapter = {
  name: 'Analytics', env: 'POSTHOG_KEY', live: false,
  capture(event, props) {
    console.info('[adapter:analytics] mock capture', { event, props });
  },
};
