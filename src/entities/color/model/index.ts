import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { Color } from '../lib';
import type { ColorGroupId } from '@/entities/colors-group';
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

  const getGlobalAmountOfColors = () => {
    let amount = 0;

    for (const [,colorCollection] of colors.value) {
      for (const [,imageColor] of colorCollection) {
        if (imageColor !== null) {
          amount++;
        }
      }
    }

    return amount;
  };
  const getNonEmptyColors = () => {
    const nonEmptyColors = new Map<ImageId, ColorCollection>();

    colors.value.forEach((colorCollection, imageId) => {
      const nonEmptyCollection = new Map<number, ImageColor>();

      colorCollection.forEach((collection, index) => {
        if (collection !== null) nonEmptyCollection.set(index, collection);
      });

      if (nonEmptyCollection.size > 0) nonEmptyColors.set(imageId, nonEmptyCollection);
    });

    return nonEmptyColors;
  };
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
  const colorCollectionToArray = (colorCollection: ColorCollection) => ([...colorCollection.entries()]);
  const nonEmptyColorCollection = (colorCollection: ColorCollection) => {
    return colorCollectionToArray(colorCollection).filter((collection): collection is [number, ImageColor] => (collection[1] !== null));
  };

  return {
    colors,
    getGlobalAmountOfColors,
    getNonEmptyColors,
    amountOfColors,
    resetColorsStore,
    getColorFromPool,
    removeColor,
    nonEmptyColorCollection,
  };
});
