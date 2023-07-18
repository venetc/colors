import type { ImageFromFile, ImageFromLink } from '@/entities/image/model';

export function createImageFromFile({ fileName, src }: { fileName: string; src: string }): ImageFromFile {
  return {
    origin: 'file',
    colors: [],
    fileName,
    src,
  };
}

export function createImageFromLink({ originalSrc, src }: { originalSrc: string; src: string }): ImageFromLink {
  return {
    origin: 'link',
    colors: [],
    originalSrc,
    src,
  };
}
