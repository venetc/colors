import { defineStore, storeToRefs } from 'pinia';
import { ref } from 'vue';
import { _appendBlankHandpickedColor, _filterOriginalColors } from './lib';
import type { Color, ColorCollection, ImageColor } from '@/entities/color';
import { generateColorData, getPalette, useColorsStore } from '@/entities/color';
import type { ImageId } from '@/entities/image';
import { useImagesStore } from '@/entities/image';

export const useEditColors = defineStore('Features/Color/EditColors', () => {
  const MIN_COLORS = 6;
  const colorReadModalIsActive = ref(false);

  const colorsModel = useColorsStore();
  const { colors } = storeToRefs(colorsModel);

  const imagesStore = useImagesStore();
  const { images } = storeToRefs(imagesStore);

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
      image.crossOrigin = 'anonymous';

      image.addEventListener('load', () => {
        const uniqueColors = generateColors(imageId, image);

        if (uniqueColors) colors.value.set(imageFromStore.id, uniqueColors);

        image.remove();
      }, { once: true });

      image.src = src;
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
    targetColor.schemeId = null;
  };
  const clearHandpickedColor = (imageColor: ImageColor) => {
    imageColor.handpicked = null;
    imageColor.isSorted = false;
    imageColor.schemeId = null;

    return imageColor;
  };
  const clearAllHandpickedColors = (imageId: ImageId) => {
    const target = colors.value.get(imageId);

    if (!target) return;

    target.forEach((color) => {
      if (!color) return;

      color.handpicked = null;
      color.isSorted = false;
      color.schemeId = null;
    });
  };
  const checkIfSomeColorsAreHandpicked = (imageId: ImageId) => {
    const target = colors.value.get(imageId);

    if (!target) return false;

    return [...target.values()].some(color => color && color.handpicked);
  };
  const removeColor = (imageId: ImageId, indexKey: number) => {
    const target = colors.value.get(imageId);
    if (!target) return;

    target.set(indexKey, null);
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
    removeColor,
    getColorsByImageId,
    cantResetColor,
    setColorReadModalIsActive,
  };
},
);
