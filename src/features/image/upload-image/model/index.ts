import { defineStore } from 'pinia';
import type { NUpload, UploadFileInfo } from 'naive-ui';
import { computed, ref } from 'vue';

import { useFetch } from '@vueuse/core';
import { createImageFromFile, createImageFromLink } from '../lib';
import { useImagesStore } from '@/entities/image';
import { formatStringToLinks } from '@/shared/lib/string';

export type BlobCache = Map<string, string>;
export type FileList = Map<string, UploadFileInfo>;
export type LinksList = Set<string>;
type BlobCacheItem = File | { blobSrc: string; originSrc: string };

export const useFileLoaderStore = defineStore('ImagesUploaderStore', () => {
  const blobCache = ref<BlobCache>(new Map());
  const cleanUploaderMethod = ref<InstanceType<typeof NUpload>['clear']>();

  const filesList = ref<FileList>(new Map());

  const linksList = ref<LinksList>(new Set());
  const totalFetchedImages = ref(0);
  const imagesFailedToFetch = ref(new Set<string>());

  const amountOflinks = computed(() => (linksList.value.size));
  const loadedWithoutError = computed(() => (totalFetchedImages.value - imagesFailedToFetch.value.size));

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
  const updateImagesFileList = ({ fileList: inputFiles }: { fileList: UploadFileInfo[] }) => {
    const upsertFileInMap = (file: UploadFileInfo) => {
      filesList.value.set(file.name, file);
    };

    inputFiles.forEach(upsertFileInMap);

    filesList.value.forEach(({ file }) => {
      addBlobToCache(file);
    });
  };
  const clearBlobCache = () => {
    blobCache.value.forEach(URL.revokeObjectURL);
    blobCache.value.clear();
  };
  const clearFileList = () => {
    filesList.value.clear();
  };
  const updateImagesListFromFiles = () => {
    filesList.value.forEach((file) => {
      const fileName = file.name;
      const src = blobCache.value.get(fileName);

      if (!src) return;

      const imagesStore = useImagesStore();

      const image = createImageFromFile({ fileName, src });
      imagesStore.addImageToList(fileName, image);
    });
  };
  const updateImagesListFromLinks = () => {
    linksList.value.forEach((originalSrc) => {
      const src = blobCache.value.get(originalSrc);

      if (!src) return;

      const imagesStore = useImagesStore();

      const image = createImageFromLink({ originalSrc, src });
      imagesStore.addImageToList(originalSrc, image);
    });
  };
  const clearUploader = () => {
    if (cleanUploaderMethod.value) cleanUploaderMethod.value();
  };
  const updateLinksList = (links: string[]) => {
    links.forEach(link => linksList.value.add(link));
  };
  const clearLinksList = () => {
    linksList.value.clear();
  };
  const getLinksFromFile = async (file: File | null | undefined) => {
    if (!file) return [];
    try {
      const text = await file.text();
      return formatStringToLinks(text);
    } catch (exception) {
      console.log(exception);
      return [];
    }
  };

  const useImageDownloader = ({ onSuccess }: { onSuccess: () => void }) => {
    const currentLink = ref('');
    const isLoading = ref(true);

    const onFetchErrorHandler = (ctx: { data: any; response: Response | null; error: any }) => {
      imagesFailedToFetch.value.add(currentLink.value);
      return ctx;
    };

    const { data, execute } = useFetch(currentLink, { immediate: false, onFetchError: onFetchErrorHandler }).blob();

    const loadImages = async () => {
      isLoading.value = true;

      for await (const link of linksList.value) {
        currentLink.value = link;

        await execute();
        totalFetchedImages.value++;

        if (data.value) {
          if (!imagesFailedToFetch.value.has(link)) {
            const blobFromLink = URL.createObjectURL(data.value);
            addBlobToCache({ originSrc: link, blobSrc: blobFromLink });
          }
        }
      }
      isLoading.value = false;

      if (imagesFailedToFetch.value.size > 0) {
        imagesFailedToFetch.value.forEach((image) => {
          linksList.value.delete(image);
        });
      } else {
        onSuccess();
      }
    };

    return { isLoading, loadImages };
  };

  return {
    blobCache,
    filesList,
    updateImagesFileList,
    removeBlobFromCache,
    clearBlobCache,
    clearFileList,
    addBlobToCache,
    updateImagesListFromFiles,
    updateImagesListFromLinks,
    cleanUploaderMethod,
    clearUploader,
    linksList,
    updateLinksList,
    imagesFailedToFetch,
    clearLinksList,
    getLinksFromFile,
    amountOflinks,
    totalFetchedImages,
    loadedWithoutError,
    useImageDownloader,
  };
});
