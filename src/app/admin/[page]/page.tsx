import { AdminPortal } from './portal';

export function generateStaticParams() {
  return ['overview', 'users', 'tasks', 'providers', 'agents', 'payments', 'credits',
    'services', 'disputes', 'analytics', 'integrations', 'audit'].map((page) => ({ page }));
}

export default function AdminPage({ params }: { params: { page: string } }) {
  return <AdminPortal page={params.page} />;
}
