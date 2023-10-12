import { defineStore, storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useImagesStore } from '@/entities/image';
import type { Img } from '@/entities/image';

export const useImageEditorStore = defineStore('ImageEditorStore', () => {
  const activeImage = ref<Img | undefined>();
  const activeImageToken = ref<string | undefined>();
  const isEditorActive = ref(false);

  const imagesStore = useImagesStore();
  const { images } = storeToRefs(imagesStore);

  const setActiveImage = (image: Img | undefined, token?: string) => {
    activeImage.value = image ? { ...image } : undefined;
    activeImageToken.value = token;
  };

  const setEditorState = (state: 'opened' | 'closed') => {
    isEditorActive.value = state === 'opened';
  };

  const setImageCroppedSrc = (croppedSrc?: string) => {
    if (!activeImage.value) return;

    if (!croppedSrc) {
      if (activeImage.value.croppedSrc) URL.revokeObjectURL(activeImage.value.croppedSrc);
      activeImage.value.croppedSrc = undefined;
    } else {
      activeImage.value.croppedSrc = croppedSrc;
    }

    if (!activeImageToken.value) return;

    const target = images.value.get(activeImageToken.value);

    if (!target) return;

    target.croppedSrc = activeImage.value.croppedSrc;
  };

  return {
    activeImage,
    activeImageToken,
    isEditorActive,
    setActiveImage,
    setEditorState,
    setImageCroppedSrc,
  };
});
