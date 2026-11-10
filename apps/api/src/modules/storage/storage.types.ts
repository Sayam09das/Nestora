export type StorageBucket = 'public' | 'private' | 'staffPublic' | 'staffPrivate';

export type StoredObjectMeta = {
  objectKey: string;
  bucket: StorageBucket;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

export type PutObjectInput = {
  bucket: StorageBucket;
  body: Buffer;
  fileName: string;
  mimeType: string;
};
