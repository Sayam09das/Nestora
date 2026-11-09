import Link from 'next/link';

export default function WardenDashboardPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-semibold">Hostel Warden</h1>
      <p className="mt-2 text-muted-foreground text-sm">Dashboard shell — operational widgets arrive in later milestones.</p>
      <Link href="/login" className="mt-6 inline-block text-sm text-primary underline">
        Back to sign in
      </Link>
    </main>
  );
}
