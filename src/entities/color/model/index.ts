import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Color } from '../lib';
import type { ImageId } from '@/entities/image';

export interface ImageColor {
  imageId: ImageId;
  isSorted: boolean;
  original: Color;
  handpicked: Color | null;
}

export const useColorsStore = defineStore('Entities/Color', () => {
  const colors = ref(new Map<ImageId, ImageColor[]>());

  const amountOfColors = (imageId: ImageId) => {
    const target = colors.value.get(imageId);
    if (!target) return 0;

    return target.length;
  };
  const resetColorsStore = () => {
    colors.value.clear();
  };

  return {
    colors,
    amountOfColors,
    resetColorsStore,
  };
});
