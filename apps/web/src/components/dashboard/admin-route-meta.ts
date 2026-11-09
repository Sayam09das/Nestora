export type AdminBreadcrumb = {
  label: string;
  href: string;
};

export type AdminRouteMeta = {
  title: string;
  breadcrumbs: AdminBreadcrumb[];
};

const dashboardCrumb: AdminBreadcrumb = { label: 'Dashboard', href: '/admin' };

export function getAdminRouteMeta(pathname: string): AdminRouteMeta {
  if (pathname === '/admin') {
    return {
      title: 'Dashboard',
      breadcrumbs: [dashboardCrumb],
    };
  }

  if (pathname === '/admin/audit-logs') {
    return {
      title: 'Audit logs',
      breadcrumbs: [dashboardCrumb, { label: 'Audit logs', href: '/admin/audit-logs' }],
    };
  }

  return {
    title: 'Administration',
    breadcrumbs: [dashboardCrumb, { label: 'Administration', href: pathname }],
  };
}
