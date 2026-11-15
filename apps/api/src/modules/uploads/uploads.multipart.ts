import type { MultipartFile } from '@fastify/multipart';
import { BadRequestError } from '../../common/errors/index.js';

export async function readSingleUpload(
  file: MultipartFile | undefined,
  maxBytes: number,
): Promise<{ buffer: Buffer; fileName: string; mimeType: string }> {
  if (!file) {
    throw new BadRequestError('No file was uploaded. Use multipart field "file".');
  }

  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of file.file) {
    total += chunk.length;
    if (total > maxBytes) {
      throw new BadRequestError('File exceeds the maximum allowed size.');
    }
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);
  if (buffer.length === 0) {
    throw new BadRequestError('Uploaded file is empty.');
  }

  const fileName = (file.filename?.trim() || 'file').slice(0, 255);
  const mimeType = file.mimetype?.trim() || 'application/octet-stream';
  return { buffer, fileName, mimeType };
}