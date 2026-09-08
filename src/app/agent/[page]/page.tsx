import { AgentPortal } from './portal';

export function generateStaticParams() {
  return ['dash', 'queue', 'assigned', 'earnings', 'performance', 'profile'].map((page) => ({ page }));
}

export default function AgentPage({ params }: { params: { page: string } }) {
  return <AgentPortal page={params.page} />;
}
