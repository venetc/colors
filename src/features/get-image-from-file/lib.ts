import type { ImageFromFile, ImageId } from '@/entities/image';

import { generateId } from '@/shared/lib/nanoid.ts';

type CreateImageFromFileArgs = Pick<ImageFromFile, 'fileName' | 'blobSrc'>;

export function createImageFromFile(payload: CreateImageFromFileArgs): ImageFromFile {
  const {
    fileName,
    blobSrc,
  } = payload;

  const id = generateId() as ImageId;

  return {
    origin: 'file',
    croppedSrc: null,
    fileName,
    blobSrc,
    id,
  };
}
