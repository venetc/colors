import type { ImageFromLink } from '@/entities/image';

type CreateImageFromLinkArgs = Pick<ImageFromLink, 'originalSrc' | 'blobSrc'>;

export function createImageFromLink(payload: CreateImageFromLinkArgs): ImageFromLink {
  const {
    originalSrc,
    blobSrc,
  } = payload;

  return {
    origin: 'link',
    croppedSrc: undefined,
    originalSrc,
    blobSrc,
  };
}
