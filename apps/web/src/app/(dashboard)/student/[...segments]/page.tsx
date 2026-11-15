import { notFound } from 'next/navigation';

type PageProps = { params: Promise<{ segments: string[] }> };

export default async function StudentUnknownSection(_props: PageProps) {
  notFound();
}
