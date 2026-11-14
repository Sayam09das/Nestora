export type StaffBreadcrumb = { label: string; href: string };

export type StaffRouteMeta = { title: string; breadcrumbs: StaffBreadcrumb[] };

const dashboardCrumb: StaffBreadcrumb = { label: 'Dashboard', href: '/staff' };

const SEGMENT_LABELS: Record<string, string> = {
  tasks: 'My Assigned Tasks',
  schedule: 'My Schedule',
  attendance: 'Attendance & Shifts',
  visitors: 'Visitor & Security Log',
  maintenance: 'Maintenance Tasks',
  housekeeping: 'Housekeeping Tasks',
  mess: 'Mess Operations',
  inventory: 'Inventory & Supplies',
  announcements: 'Announcements',
  messages: 'Messages',
  report: 'Report an Issue',
  profile: 'My Profile',
  settings: 'Settings',
  tickets: 'My tickets',
  duties: 'Duties & shifts',
  residents: 'Residents',
};

export function getStaffRouteMeta(pathname: string): StaffRouteMeta {
  if (pathname === '/staff' || !pathname.startsWith('/staff')) {
    return { title: 'Overview', breadcrumbs: [dashboardCrumb] };
  }

  const segments = pathname.replace(/^\/staff\/?/, '').split('/').filter(Boolean);
  const crumbs: StaffBreadcrumb[] = [dashboardCrumb];
  let acc = '/staff';

  for (const segment of segments) {
    acc += `/${segment}`;
    const label = SEGMENT_LABELS[segment] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({ label, href: acc });
  }

  const title = crumbs[crumbs.length - 1]?.label ?? 'Overview';
  return { title, breadcrumbs: crumbs };
}
