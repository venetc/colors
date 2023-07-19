import type { ImageFromFile } from '@/entities/image';

export function createImageFromFile({ fileName, src }: { fileName: string; src: string }): ImageFromFile {
  return {
    origin: 'file',
    colors: [],
    fileName,
    src,
  };
}
