import { WardenIncidentsDetailRoute } from '@/components/dashboard/warden/incidents/warden-incidents-detail-route';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return createPrivatePageMetadata('Incident report', 'Emergency incident details.', `/warden/incidents/${id}`);
}

export default async function WardenIncidentDetailPageRoute({ params }: PageProps) {
  const { id } = await params;
  return <WardenIncidentsDetailRoute incidentId={id} />;
}
