import { randomUUID } from 'node:crypto';

const OBJECT_KEY_RE = /^[0-9a-f-]{36}\/[a-zA-Z0-9._-]+$/;

export function isSafeObjectKey(key: string): boolean {
  return OBJECT_KEY_RE.test(key) && !key.includes('..');
}

export function buildObjectKey(originalFileName: string): string {
  const base = originalFileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 120);
  const name = base.length > 0 ? base : 'file';
  return `${randomUUID()}/${name}`;
}
