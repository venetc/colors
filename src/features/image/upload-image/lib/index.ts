import type { ImageFromFile } from '@/entities/image';

type CreateImageFromFileArgs = Pick<ImageFromFile, 'fileName' | 'blobSrc'>;

export function createImageFromFile(payload: CreateImageFromFileArgs): ImageFromFile {
  const {
    fileName,
    blobSrc,
  } = payload;

  return {
    origin: 'file',
    croppedSrc: undefined,
    fileName,
    blobSrc,
  };
}
