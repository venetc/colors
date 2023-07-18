import { useFetch } from '@vueuse/core';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { createImageFromLink } from '../lib';
import { useImagesStore } from '@/entities/image';

export type LinksList = Set<string>;

export const useImageDownlaoderStore = defineStore('ImagesDownloaderStore', () => {
  const linksList = ref<LinksList>(new Set());
  const totalFetchedImages = ref(0);
  const imagesFailedToFetch = ref(new Set<string>());

  const amountOflinks = computed(() => (linksList.value.size));
  const loadedWithoutError = computed(() => (totalFetchedImages.value - imagesFailedToFetch.value.size));

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
            console.log(blobFromLink);

            // addBlobToCache({ originSrc: link, blobSrc: blobFromLink });
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
  const clearLinksList = () => {
    linksList.value.clear();
  };
  const updateImagesListFromLinks = () => {
    linksList.value.forEach((originalSrc) => {
      // const src = blobCache.value.get(originalSrc);
      const src = undefined;

      if (!src) return;

      const imagesStore = useImagesStore();

      const image = createImageFromLink({ originalSrc, src });
      imagesStore.addImageToList(originalSrc, image);
    });
  };

  return { linksList, imagesFailedToFetch, amountOflinks, totalFetchedImages, loadedWithoutError, useImageDownloader, clearLinksList, updateImagesListFromLinks };
});
