import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Color } from '../lib';
import type { ColorGroupId } from '@/features/color/sort-colors';
import type { ImageId } from '@/entities/image';

export interface ImageColor {
  imageId: ImageId;
  colorGroupId: ColorGroupId | null;
  isSorted: boolean;
  original: Color;
  handpicked: Color | null;
}

export type ColorCollection = Map<number, ImageColor | null>;

export const useColors = defineStore('Entities/Color', () => {
  const colors = ref(new Map<ImageId, ColorCollection>());

  const amountOfColors = (imageId: ImageId) => {
    const target = colors.value.get(imageId);
    if (!target) return 0;

    return [...target.values()].filter(color => color !== null).length;
  };
  const resetColorsStore = () => {
    colors.value.clear();
  };
  const getColorFromPool = (imageId: ImageId, colorIndex: number) => {
    const targetColorsFromPool = colors.value.get(imageId);

    if (!targetColorsFromPool) return;

    return targetColorsFromPool.get(colorIndex);
  };
  const removeColor = (imageId: ImageId, indexKey: number) => {
    const target = colors.value.get(imageId);
    if (!target) return;

    target.set(indexKey, null);
  };
  return {
    colors,
    amountOfColors,
    resetColorsStore,
    getColorFromPool,
    removeColor,
  };
});
