import { _appendBlankHandpickedColor, _filterOriginalColors } from './lib';

import { defineStore, storeToRefs } from 'pinia';
import { ref } from 'vue';

import type { Color, ColorCollection, ImageColor } from '@/entities/color';
import type { ImageId } from '@/entities/image';

import { generateColorData, getPalette, useColors } from '@/entities/color';
import { useImages } from '@/entities/image';

export const useEditColors = defineStore('Features/Color/EditColors', () => {
  const MIN_COLORS = 6;
  const colorReadModalIsActive = ref(false);

  const colorsModel = useColors();
  const { colors } = storeToRefs(colorsModel);

  const imagesModel = useImages();
  const { images } = storeToRefs(imagesModel);

  const generateColors = (imageId: ImageId, imageElement: HTMLImageElement) => {
    const paletteGeneratorPayload = {
      img: imageElement,
      colorCount: MIN_COLORS,
    };

    const palette = getPalette(paletteGeneratorPayload);

    if (!palette) return;

    const colorData = palette.map(generateColorData);

    const template = Array.from({ length: MIN_COLORS }).fill(null);

    return _filterOriginalColors(colorData)
      .reduce((_template: Array<ImageColor | null>, color, index) => {
        _template[index] = _appendBlankHandpickedColor(color, imageId);

        return _template;
      }, template as Array<ImageColor | null>)
      .reduce((map: ColorCollection, color: ImageColor | null, index) => {
        map.set(index, color);
        return map;
      }, new Map());
  };

  const readColorsFromImage = (imageId: ImageId, imageElement?: HTMLImageElement) => {
    const imageFromStore = images.value.get(imageId);
    if (!imageFromStore) return;

    if (imageElement) {
      const uniqueColors = generateColors(imageId, imageElement);

      if (uniqueColors) colors.value.set(imageFromStore.id, uniqueColors);
    } else {
      const src = imageFromStore.croppedSrc ?? imageFromStore.blobSrc;
      const image = new Image();
      image.src = src;
      image.crossOrigin = 'anonymous';
      image.width = image.height = 500;

      if (image.complete) {
        const uniqueColors = generateColors(imageId, image);
        if (uniqueColors) colors.value.set(imageFromStore.id, uniqueColors);

        image.remove();
      } else {
        image.addEventListener('load', () => {
          const uniqueColors = generateColors(imageId, image);

          if (uniqueColors) colors.value.set(imageFromStore.id, uniqueColors);

          image.remove();
        }, { once: true });
      }
    }
  };
  const handpickColor = (newColor: Color, indexKey: number, imageId: ImageId) => {
    const target = colors.value.get(imageId);

    if (!target) return;

    const targetColor = target.get(indexKey);

    if (!targetColor) return;

    if (targetColor.handpicked && targetColor.handpicked.hex === newColor.hex) return;

    targetColor.handpicked = newColor;
    targetColor.isSorted = false;
    targetColor.colorGroupId = null;
  };
  const clearHandpickedColor = (imageColor: ImageColor) => {
    imageColor.handpicked = null;
    imageColor.isSorted = false;
    imageColor.colorGroupId = null;

    return imageColor;
  };
  const clearAllHandpickedColors = (imageId: ImageId) => {
    const target = colors.value.get(imageId);

    if (!target) return;

    target.forEach((color) => {
      if (!color) return;

      color.handpicked = null;
      color.isSorted = false;
      color.colorGroupId = null;
    });
  };
  const checkIfSomeColorsAreHandpicked = (imageId: ImageId) => {
    const target = colors.value.get(imageId);

    if (!target) return false;

    return [...target.values()].some(color => color && color.handpicked);
  };
  const getColorsByImageId = (id: ImageId) => (colors.value.get(id));
  const cantResetColor = (id: ImageId) => {
    const someAreHandpicked = checkIfSomeColorsAreHandpicked(id);
    const someAreDeleted = colorsModel.amountOfColors(id) < MIN_COLORS;

    return !someAreDeleted && !someAreHandpicked;
  };
  const setColorReadModalIsActive = (isActive: boolean) => {
    colorReadModalIsActive.value = isActive;
  };

  return {
    MIN_COLORS,
    colorReadModalIsActive,
    readColorsFromImage,
    handpickColor,
    clearHandpickedColor,
    clearAllHandpickedColors,
    checkIfSomeColorsAreHandpicked,
    getColorsByImageId,
    cantResetColor,
    setColorReadModalIsActive,
  };
});
