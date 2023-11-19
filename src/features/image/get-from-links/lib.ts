import type { ImageFromLink, ImageId } from '@/entities/image';

import { generateId } from '@/shared/lib/nanoid';

type CreateImageFromLinkArgs = Pick<ImageFromLink, 'originalSrc' | 'blobSrc'>;

export function createImageFromLink(payload: CreateImageFromLinkArgs): ImageFromLink {
  const {
    originalSrc,
    blobSrc,
  } = payload;

  const id = generateId() as ImageId;

  return {
    origin: 'link',
    croppedSrc: null,
    originalSrc,
    blobSrc,
    id,
  };
}
