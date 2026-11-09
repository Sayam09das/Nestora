import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync } from 'node:crypto';

const ALGO = 'aes-256-gcm';
const KEY_LEN = 32;

function deriveKey(secret: string): Buffer {
  return scryptSync(secret, 'nestora-mfa', KEY_LEN);
}

export function encryptWithSecret(plaintext: string, secret: string): string {
  const key = deriveKey(secret);
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export function decryptWithSecret(ciphertext: string, secret: string): string {
  const raw = Buffer.from(ciphertext, 'base64');
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const data = raw.subarray(28);
  const key = deriveKey(secret);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

export function sha256HexFast(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}
