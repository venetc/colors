import { storeToRefs } from 'pinia';
import { unref } from 'vue';
import type { MaybeRef } from 'vue/dist/vue';
import { _appendBlankHandpickedColor, _filterOriginalColors } from './lib';
import type { Color, ColorCollection, ImageColor } from '@/entities/color';
import { generateColorData, getPalette, useColorsStore } from '@/entities/color';
import type { ImageId } from '@/entities/image';
import { useImagesStore } from '@/entities/image';

export function useEditColors() {
  const MIN_COLORS = 6;

  const colorsStore = useColorsStore();
  const { colors } = storeToRefs(colorsStore);

  const imagesStore = useImagesStore();
  const { images } = storeToRefs(imagesStore);

  const readColorsFromImage = (id: MaybeRef<ImageId>) => {
    const imageId = unref(id);

    const targetImage = images.value.get(imageId);
    if (!targetImage) return;

    const img = new Image();
    const src = targetImage.croppedSrc ?? targetImage.blobSrc;
    img.crossOrigin = 'anonymous';
    img.src = src;

    const generatePalette = () => {
      const paletteGeneratorPayload = {
        img,
        colorCount: MIN_COLORS,
      };

      const palette = getPalette(paletteGeneratorPayload);

      if (!palette) return;

      const colorData = palette.map(generateColorData);

      const template = Array.from({ length: MIN_COLORS }).fill(null);

      const uniqueColors = _filterOriginalColors(colorData)
        .reduce((_template: Array<ImageColor | null>, color, index) => {
          _template[index] = _appendBlankHandpickedColor(color, targetImage.id);

          return _template;
        }, template as Array<ImageColor | null>)
        .reduce((map: ColorCollection, color: ImageColor | null, index) => {
          map.set(index, color);
          return map;
        }, new Map());

      colors.value.set(targetImage.id, uniqueColors);

      img.removeAttribute('src');
    };

    img.complete ? generatePalette() : img.addEventListener('load', generatePalette);
  };
  const handpickColor = (newColor: Color, indexKey: number, imageId: ImageId) => {
    const target = colors.value.get(imageId);

    if (!target) return;

    const targetColor = target.get(indexKey);

    if (!targetColor) return;

    if (targetColor.handpicked && targetColor.handpicked.hex === newColor.hex) return;

    targetColor.handpicked = newColor;
    targetColor.isSorted = false;
  };
  const clearHandpickedColor = (imageColor: ImageColor) => {
    imageColor.handpicked = null;
    imageColor.isSorted = false;

    return imageColor;
  };
  const clearAllHandpickedColors = (imageId: ImageId) => {
    const target = colors.value.get(imageId);

    if (!target) return;

    target.forEach((color) => {
      if (!color) return;

      color.handpicked = null;
      color.isSorted = false;
    });
  };
  const checkIfSomeColorsAreHandpicked = (imageId: ImageId) => {
    const target = colors.value.get(imageId);

    if (!target) return false;

    return [...target.values()].some(color => color && color.handpicked);
    // return target.some(color => color.handpicked);
  };
  const removeColor = (imageId: ImageId, indexKey: number) => {
    const target = colors.value.get(imageId);
    if (!target) return;

    target.set(indexKey, null);
  };
  const getColorsByImageId = (id: ImageId) => (colors.value.get(id));

  return {
    MIN_COLORS,
    readColorsFromImage,
    handpickColor,
    clearHandpickedColor,
    clearAllHandpickedColors,
    checkIfSomeColorsAreHandpicked,
    removeColor,
    getColorsByImageId,
  };
}
