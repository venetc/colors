import { defineStore } from 'pinia';
import { ref } from 'vue';

interface CoreProps { src: string; colors: string[] }
export type ImageFromFile = CoreProps & { origin: 'file'; fileName: string };
export type ImageFromLink = CoreProps & { origin: 'link'; originalSrc: string };
export type Img = ImageFromFile | ImageFromLink;
export type BlobCache = Map<string, string>;
export type BlobCacheItem = File | { blobSrc: string; originSrc: string };

export const useImagesStore = defineStore('ImagesStore', () => {
  const images = ref<Map<string, Img>>(new Map());
  const blobCache = ref<BlobCache>(new Map());

  const addImageToList = (token: string, image: Img) => {
    if (images.value.has(token)) return;

    images.value.set(token, image);
  };
  const removeImageFromList = (token: string) => {
    return images.value.delete(token);
  };
  const addBlobToCache = (entity: BlobCacheItem | null | undefined) => {
    if (!entity) return;

    if (entity instanceof File) {
      const blobFromCache = blobCache.value.get(entity.name);

      if (blobFromCache) return;

      const src = URL.createObjectURL(entity);
      blobCache.value.set(entity.name, src);
    } else {
      blobCache.value.set(entity.originSrc, entity.blobSrc);
    }
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

  return { images, blobCache, addImageToList, removeImageFromList, addBlobToCache, removeBlobFromCache, clearBlobCache };
});
