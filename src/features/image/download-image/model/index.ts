import { useFetch } from '@vueuse/core';
import { defineStore, storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { createImageFromLink } from '../lib';
import { useImagesStore } from '@/entities/image';

export type LinksSet = Set<string>;

export const useImageDownloaderStore = defineStore('ImagesDownloaderStore', () => {
  const linksList = ref<LinksSet>(new Set());
  const totalFetchedImages = ref(0);
  const imagesFailedToFetch = ref<LinksSet>(new Set());

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
      const imagesStore = useImagesStore();
      const { blobCache } = storeToRefs(imagesStore);

      for await (const link of linksList.value) {
        currentLink.value = link;

        const alreadyInCache = blobCache.value.get(link);

        if (alreadyInCache) {
          totalFetchedImages.value++;
        } else {
          await execute();
          totalFetchedImages.value++;

          if (data.value && !imagesFailedToFetch.value.has(link)) {
            const blobFromLink = URL.createObjectURL(data.value);

            imagesStore.addBlobToCache({
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
    const imagesStore = useImagesStore();
    const { blobCache } = storeToRefs(imagesStore);
    linksList.value.forEach((originalSrc) => {
      const src = blobCache.value.get(originalSrc);

      if (!src) return;

      const imagesStore = useImagesStore();

      const image = createImageFromLink({
        originalSrc,
        src,
      });
      imagesStore.addImageToList(originalSrc, image);
    });
  };
  const updateLinksList = (links: string[]) => {
    links.forEach(link => linksList.value.add(link));
  };

  return {
    linksList,
    imagesFailedToFetch,
    amountOfLinks,
    totalFetchedImages,
    loadedWithoutError,
    useImageDownloader,
    clearLinksList,
    updateImagesListFromLinks,
    updateLinksList,
  };
});
