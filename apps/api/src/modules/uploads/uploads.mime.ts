import { BadRequestError } from '../../common/errors/index.js';

const PHOTO_MIMES = new Set(['image/jpeg', 'image/png']);
const DOCUMENT_MIMES = new Set(['image/jpeg', 'image/png', 'application/pdf']);

export type DetectedMime = 'image/jpeg' | 'image/png' | 'application/pdf';

export function sniffFileMime(buffer: Buffer): DetectedMime | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
    return 'application/pdf';
  }
  return null;
}

function normalizeDeclaredMime(mime: string): string {
  const lowered = mime.toLowerCase().split(';')[0]?.trim() ?? '';
  if (lowered === 'image/jpg') return 'image/jpeg';
  return lowered;
}

export function assertAllowedPhoto(buffer: Buffer, declaredMime: string): DetectedMime {
  const sniffed = sniffFileMime(buffer);
  if (!sniffed || !PHOTO_MIMES.has(sniffed)) {
    throw new BadRequestError('Only JPEG or PNG profile photos are allowed.');
  }
  const declared = normalizeDeclaredMime(declaredMime);
  if (declared && PHOTO_MIMES.has(declared) && declared !== sniffed) {
    throw new BadRequestError('File content does not match the declared image type.');
  }
  return sniffed;
}

export function assertAllowedDocument(buffer: Buffer, declaredMime: string): DetectedMime {
  const sniffed = sniffFileMime(buffer);
  if (!sniffed || !DOCUMENT_MIMES.has(sniffed)) {
    throw new BadRequestError('Only JPEG, PNG, or PDF documents are allowed.');
  }
  const declared = normalizeDeclaredMime(declaredMime);
  if (declared && DOCUMENT_MIMES.has(declared) && declared !== sniffed) {
    throw new BadRequestError('File content does not match the declared document type.');
  }
  return sniffed;
}