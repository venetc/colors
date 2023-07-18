import type { ImageFromLink } from '@/entities/image';

export function createImageFromLink({ originalSrc, src }: { originalSrc: string; src: string }): ImageFromLink {
  return {
    origin: 'link',
    colors: [],
    originalSrc,
    src,
  };
}
