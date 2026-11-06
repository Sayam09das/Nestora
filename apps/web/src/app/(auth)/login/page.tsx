import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata('Login', 'Sign in to Nestora.', '/login');

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-[var(--container-marketing)] px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-h1 font-semibold text-foreground">Login</h1>
      <p className="mt-2 text-body text-muted-foreground">Authentication will open here.</p>
    </main>
  );
}
