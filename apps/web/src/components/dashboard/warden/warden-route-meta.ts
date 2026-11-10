export type WardenBreadcrumb = { label: string; href: string };

export type WardenRouteMeta = { title: string; breadcrumbs: WardenBreadcrumb[] };

const dashboardCrumb: WardenBreadcrumb = { label: 'Dashboard', href: '/warden' };

const SEGMENT_LABELS: Record<string, string> = {
  attendance: 'Attendance',
  complaints: 'Complaints',
  leave: 'Leave & outings',
  students: 'Residents',
  visitors: 'Visitors',
};

export function getWardenRouteMeta(pathname: string): WardenRouteMeta {
  if (pathname === '/warden' || !pathname.startsWith('/warden')) {
    return { title: 'Dashboard', breadcrumbs: [dashboardCrumb] };
  }

  const segments = pathname.replace(/^\/warden\/?/, '').split('/').filter(Boolean);
  const crumbs: WardenBreadcrumb[] = [dashboardCrumb];
  let acc = '/warden';

  for (const segment of segments) {
    acc += `/${segment}`;
    const label = SEGMENT_LABELS[segment] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({ label, href: acc });
  }

  const title = crumbs[crumbs.length - 1]?.label ?? 'Dashboard';
  return { title, breadcrumbs: crumbs };
}
