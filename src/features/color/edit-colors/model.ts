import { storeToRefs } from 'pinia';
import { unref } from 'vue';
import type { MaybeRef } from 'vue/dist/vue';
import { _appendBlankHandpickedColor, _filterOriginalColors } from './lib';
import { useImagesStore } from '@/entities/image';
import type { ImageId } from '@/entities/image';
import type { Color, ImageColor } from '@/entities/color';
import { generateColorData, getPalette, useColorsStore } from '@/entities/color';

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
      const uniqueColors = _filterOriginalColors(colorData).map(color => _appendBlankHandpickedColor(color, targetImage.id));

      colors.value.set(targetImage.id, uniqueColors);

      img.removeAttribute('src');
    };

    img.complete ? generatePalette() : img.addEventListener('load', generatePalette);
  };
  const handpickColor = (newColor: Color, colorToChange: ImageColor) => {
    if (colorToChange.handpicked && colorToChange.handpicked.hex === newColor.hex) return;

    colorToChange.handpicked = newColor;
    colorToChange.isSorted = false;
  };
  const clearHandpickedColor = (imageColor: ImageColor) => {
    imageColor.handpicked = null;
    imageColor.isSorted = false;

    return imageColor;
  };
  const clearAllHandpickedColors = (imageId: ImageId) => {
    const target = colors.value.get(imageId);

    if (!target) return;

    colors.value.set(imageId, target.map(clearHandpickedColor));
  };
  const checkIfSomeColorsAreHandpicked = (imageId: ImageId) => {
    const target = colors.value.get(imageId);

    if (!target) return false;

    return target.some(color => color.handpicked);
  };
  const removeColor = (imageId: ImageId, color: ImageColor) => {
    const target = colors.value.get(imageId);
    if (!target) return;

    const result = target.filter(_color => (_color.original.hex !== color.original.hex));

    colors.value.set(imageId, result);
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
