import { findAdminNavTitle } from '@/components/dashboard/admin-nav-items';

export type AdminBreadcrumb = {
  label: string;
  href: string;
};

export type AdminRouteMeta = {
  title: string;
  breadcrumbs: AdminBreadcrumb[];
};

const dashboardCrumb: AdminBreadcrumb = { label: 'Dashboard', href: '/admin' };

function crumbsForPath(pathname: string): AdminBreadcrumb[] {
  const crumbs: AdminBreadcrumb[] = [dashboardCrumb];
  const segments = pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean);

  if (segments.length === 0) {
    return crumbs;
  }

  let acc = '/admin';
  for (const segment of segments) {
    acc += `/${segment}`;
    const title = findAdminNavTitle(acc) ?? segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({ label: title, href: acc });
  }

  return crumbs;
}

export function getAdminRouteMeta(pathname: string): AdminRouteMeta {
  const title = findAdminNavTitle(pathname) ?? (pathname === '/admin' ? 'Dashboard' : 'Administration');

  if (pathname === '/admin') {
    return {
      title: 'Dashboard',
      breadcrumbs: [dashboardCrumb],
    };
  }

  return {
    title,
    breadcrumbs: crumbsForPath(pathname),
  };
}

/** Used by placeholders to resolve friendly section names */
export function getAdminSectionLabelFromPath(pathname: string): string {
  return findAdminNavTitle(pathname) ?? getAdminRouteMeta(pathname).title;
}
