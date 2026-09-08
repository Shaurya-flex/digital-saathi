import { ProviderPortal } from './portal';

export function generateStaticParams() {
  return ['dash', 'jobs', 'calendar', 'earnings', 'reviews', 'profile', 'verify'].map((page) => ({ page }));
}

export default function ProviderPage({ params }: { params: { page: string } }) {
  return <ProviderPortal page={params.page} />;
}
