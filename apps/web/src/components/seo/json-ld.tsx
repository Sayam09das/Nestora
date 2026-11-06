import { serializeJsonLd } from '@/lib/seo/structured-data';

type JsonLdProps = {
  data: Record<string, unknown>;
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires inline script; data is server-built only.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
