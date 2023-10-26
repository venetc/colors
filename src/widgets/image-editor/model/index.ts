import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ImageId, Img } from '@/entities/image';

export const useImageEditorStore = defineStore('Widgets/ImageEditor', () => {
  const activeImage = ref<Img | null>(null);
  const activeImageId = ref<ImageId | null>(null);
  const isEditorActive = ref(false);

  const setActiveImage = (image: Img | null) => {
    activeImage.value = image;
  };
  const setActiveImageId = (id: ImageId | null) => {
    activeImageId.value = id;
  };
  const setEditorState = (state: 'opened' | 'closed') => {
    isEditorActive.value = state === 'opened';
  };
  const setImageCroppedSrc = (croppedSrc: string | null) => {
    if (!activeImage.value) return;

    if (!croppedSrc) {
      if (activeImage.value.croppedSrc) URL.revokeObjectURL(activeImage.value.croppedSrc);
      activeImage.value.croppedSrc = null;
    } else {
      activeImage.value.croppedSrc = croppedSrc;
    }
  };

  return {
    activeImage,
    isEditorActive,
    activeImageId,
    setActiveImage,
    setEditorState,
    setImageCroppedSrc,
    setActiveImageId,
  };
});
