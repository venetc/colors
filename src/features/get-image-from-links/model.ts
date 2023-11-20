import { createImageFromLink } from './lib.ts';

import { useFetch } from '@vueuse/core';
import { defineStore, storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

import type { NUpload, UploadFileInfo } from 'naive-ui';
import type { Ref } from 'vue';

import { NoValidLinksError, useNotificationManager } from '@/shared/ui/notification';
import { useImages } from '@/entities/image';
import { formatStringToLinks } from '@/shared/lib/string.ts';

export type FileList = Map<string, UploadFileInfo>;
export type LinksSet = Set<string>;

export const useGetImageFromLinks = defineStore('Features/GetFromLinks', () => {
  const cleanUploaderMethod = ref<InstanceType<typeof NUpload>['clear'] | undefined>();
  const linksList = ref<LinksSet>(new Set());
  const totalFetchedImages = ref(0);
  const imagesFailedToFetch = ref<LinksSet>(new Set());

  const textareaData = ref('');

  const amountOfLinks = computed(() => (linksList.value.size));
  const loadedWithoutError = computed(() => (totalFetchedImages.value - imagesFailedToFetch.value.size));

  const useImageDownloader = ({ onSuccess }: { onSuccess: () => void }) => {
    const currentLink = ref('');
    const isLoading = ref(true);

    const onFetchErrorHandler = (ctx: { data: any; response: Response | null; error: any }) => {
      imagesFailedToFetch.value.add(currentLink.value);
      return ctx;
    };

    const {
      data,
      execute,
    } = useFetch(currentLink, {
      immediate: false,
      onFetchError: onFetchErrorHandler,
    }).blob();

    const loadImages = async () => {
      isLoading.value = true;
      const imagesModel = useImages();
      const { cache } = storeToRefs(imagesModel);

      for await (const link of linksList.value) {
        currentLink.value = link;

        const alreadyInCache = cache.value.get(link);

        if (alreadyInCache) {
          totalFetchedImages.value++;
        } else {
          await execute();
          totalFetchedImages.value++;

          if (data.value && !imagesFailedToFetch.value.has(link)) {
            const blobFromLink = URL.createObjectURL(data.value);

            imagesModel.addBlobToCache({
              originSrc: link,
              blobSrc: blobFromLink,
            });
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

    return {
      isLoading,
      loadImages,
    };
  };
  const clearLinksList = () => {
    linksList.value.clear();
  };
  const updateImagesListFromLinks = () => {
    const imagesModel = useImages();
    const { cache } = storeToRefs(imagesModel);

    linksList.value.forEach((originalSrc) => {
      const blobSrc = cache.value.get(originalSrc);

      if (!blobSrc) return;

      const image = createImageFromLink({
        originalSrc,
        blobSrc,
      });

      imagesModel.addImageToList(image.id, image);
    });
  };
  const updateLinksList = (links: string[]) => {
    links.forEach(link => linksList.value.add(link));
  };

  const getLinksFromFile = async (file: File | null | undefined): Promise<string[]> => {
    if (!file) return [];
    try {
      const text = await file.text();
      return formatStringToLinks(text);
    } catch (exception) {
      console.warn(exception);
      return [];
    }
  };

  const clearUploader = () => {
    if (cleanUploaderMethod.value) cleanUploaderMethod.value();
  };
  const setCleanMethod = (uploader: Ref<InstanceType<typeof NUpload> | undefined>) => {
    cleanUploaderMethod.value = uploader.value?.clear;
  };

  const { callNotification: popInvalidLinksNotification } = useNotificationManager({
    type: 'error',
    title: 'No valid links found!',
    content: NoValidLinksError,
  });

  const parseInputValue = () => {
    const links = formatStringToLinks(textareaData.value);

    if (links.length > 0) {
      updateLinksList(links);
    } else {
      popInvalidLinksNotification();
    }
  };
  const resetInput = () => {
    textareaData.value = '';
  };

  return {
    linksList,
    imagesFailedToFetch,
    amountOfLinks,
    totalFetchedImages,
    loadedWithoutError,
    cleanUploaderMethod,
    textareaData,
    useImageDownloader,
    clearLinksList,
    updateImagesListFromLinks,
    updateLinksList,
    clearUploader,
    setCleanMethod,
    getLinksFromFile,
    parseInputValue,
    resetInput,
  };
});
