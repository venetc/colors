import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Img } from '@/entities/image';

export const useImageEditorStore = defineStore('ImageEditor', () => {
  const activeImage = ref<Img | undefined>();
  const isEditorActive = ref(false);

  const setActiveImage = (image: Img | undefined) => {
    activeImage.value = image;
  };

  const setEditorState = (state: 'opened' | 'closed') => {
    isEditorActive.value = state === 'opened';
  };

  return {
    activeImage,
    isEditorActive,
    setActiveImage,
    setEditorState,
  };
});
