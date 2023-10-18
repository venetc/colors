import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface CoreImageProps {
  blobSrc: string;
  croppedSrc: string | undefined;
}

export type ImageFromFile = CoreImageProps & { origin: 'file'; fileName: string };
export type ImageFromLink = CoreImageProps & { origin: 'link'; originalSrc: string };
export type Img = ImageFromFile | ImageFromLink;
export type BlobCache = Map<string, string>;
export type BlobCacheItem = File | { blobSrc: string; originSrc: string };

export const useImagesStore = defineStore('ImagesStore', () => {
  const downloadOrigin = ref<'images' | 'txt' | 'links' | undefined>();
  const images = ref<Map<string, Img>>(new Map());
  const blobCache = ref<BlobCache>(new Map());

  const addImageToList = (uuid: string, image: Img) => {
    if (images.value.has(uuid)) return;

    images.value.set(uuid, image);
  };
  const removeImageFromList = (token: string) => {
    return images.value.delete(token);
  };
  const addBlobToCache = (entity: BlobCacheItem | null | undefined) => {
    if (!entity) return;

    const isFile = entity instanceof File;
    const token = isFile ? entity.name : entity.originSrc;
    const existingBlobInCache = blobCache.value.get(token);
    const uncachedImage = images.value.get(token);

    if (existingBlobInCache) return;

    const src = isFile ? URL.createObjectURL(entity) : entity.blobSrc;

    blobCache.value.set(token, uncachedImage ? uncachedImage.blobSrc : src);
  };
  const removeBlobFromCache = (entity: BlobCacheItem) => {
    const key = entity instanceof File ? entity.name : entity.originSrc;
    const blobFromMap = blobCache.value.get(key);

    if (blobFromMap) {
      URL.revokeObjectURL(blobFromMap);
      blobCache.value.delete(key);
    }
  };
  const clearBlobCache = () => {
    blobCache.value.forEach(URL.revokeObjectURL);
    blobCache.value.clear();
  };

  return {
    images,
    blobCache,
    downloadOrigin,
    addImageToList,
    removeImageFromList,
    addBlobToCache,
    removeBlobFromCache,
    clearBlobCache,
  };
});
