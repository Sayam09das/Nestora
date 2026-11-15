import { notFound } from 'next/navigation';

type PageProps = { params: Promise<{ segments: string[] }> };

export default async function StaffUnknownSection(_props: PageProps) {
  notFound();
}