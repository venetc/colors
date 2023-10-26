import { defineStore } from 'pinia';
import { ref, unref } from 'vue';
import type { MaybeRef } from 'vue';

export type ImageId = Brand<Id, 'ImageId'>;

export interface CoreImageProps {
  blobSrc: string;
  croppedSrc: string | null;
  id: ImageId;
}

export type ImageFromFile = CoreImageProps & {
  origin: 'file';
  fileName: string;
};
export type ImageFromLink = CoreImageProps & {
  origin: 'link';
  originalSrc: string;
};
export type Img = ImageFromFile | ImageFromLink;
export type BlobCache = Map<string, string>;
export type BlobCacheItem = File | {
  blobSrc: string;
  originSrc: string;
};

export const useImagesStore = defineStore('Entities/Image', () => {
  const downloadOrigin = ref<'images' | 'txt' | 'links' | undefined>();
  const images = ref<Map<ImageId, Img>>(new Map());
  const cache = ref<BlobCache>(new Map());

  const addImageToList = (id: ImageId, image: MaybeRef<Img>) => {
    if (images.value.has(id)) return;

    const img = unref(image);

    images.value.set(id, img);
  };
  const removeImageFromList = (id: ImageId) => {
    const target = images.value.get(id);
    if (!target) return;

    const targetInCache = cache.value.get(target.origin === 'file' ? target.fileName : target.originalSrc);

    if (target.croppedSrc) URL.revokeObjectURL(target.croppedSrc);
    if (!targetInCache) URL.revokeObjectURL(target.blobSrc);

    images.value.delete(id);
  };

  const addBlobToCache = (entity: BlobCacheItem | null | undefined) => {
    if (!entity) return;

    const isFile = entity instanceof File;
    const token = isFile ? entity.name : entity.originSrc;
    const existingBlobInCache = cache.value.get(token);

    if (existingBlobInCache) return;

    const src = isFile ? URL.createObjectURL(entity) : entity.blobSrc;

    cache.value.set(token, src);
  };
  const removeBlobFromCache = (entity: BlobCacheItem) => {
    const key = entity instanceof File ? entity.name : entity.originSrc;
    const blobFromMap = cache.value.get(key);

    if (blobFromMap) {
      URL.revokeObjectURL(blobFromMap);
      cache.value.delete(key);
    }
  };
  const clearCache = () => {
    cache.value.forEach(URL.revokeObjectURL);
    cache.value.clear();
  };
  const getImageById = (imageId: ImageId) => {
    return images.value.get(imageId);
  };

  return {
    images,
    cache,
    downloadOrigin,
    addImageToList,
    removeImageFromList,
    addBlobToCache,
    removeBlobFromCache,
    clearCache,
    getImageById,
  };
});
