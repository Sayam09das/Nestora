export type StudentBreadcrumb = { label: string; href: string };

export type StudentRouteMeta = { title: string; breadcrumbs: StudentBreadcrumb[] };

const dashboardCrumb: StudentBreadcrumb = { label: 'Dashboard', href: '/student' };

const SEGMENT_LABELS: Record<string, string> = {
  profile: 'My Profile',
  room: 'My Room & Bed',
  attendance: 'My Attendance',
  roommates: 'My Roommates',
  leave: 'Leave Requests',
  'gate-passes': 'Gate Passes',
  complaints: 'Complaints',
  maintenance: 'Maintenance Requests',
  visitors: 'Visitor Requests',
  fees: 'Fee & Payments',
  announcements: 'Announcements',
  events: 'Events & Activities',
  rules: 'Hostel Rules & Policies',
  emergency: 'Emergency Contacts',
  settings: 'Settings',
  help: 'Help & Support',
  messages: 'Messages',
};

export function getStudentRouteMeta(pathname: string): StudentRouteMeta {
  if (pathname === '/student' || !pathname.startsWith('/student')) {
    return { title: 'Dashboard', breadcrumbs: [dashboardCrumb, { label: 'Overview', href: '/student' }] };
  }

  const segments = pathname.replace(/^\/student\/?/, '').split('/').filter(Boolean);
  const crumbs: StudentBreadcrumb[] = [dashboardCrumb];
  let acc = '/student';

  for (const segment of segments) {
    acc += `/${segment}`;
    const label = SEGMENT_LABELS[segment] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({ label, href: acc });
  }

  const title = crumbs[crumbs.length - 1]?.label ?? 'Dashboard';
  return { title, breadcrumbs: crumbs };
}
