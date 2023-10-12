import { defineStore } from 'pinia';
import type { MaybeRef } from 'vue';
import { ref, unref } from 'vue';
import type { Color } from '../lib';
import { generateColorData, getPalette } from '../lib';

export interface ImageColor {
  original: Color;
  selected: Color | null;
}

export const useColorsStore = defineStore('ColorsStore', () => {
  const MIN_COLORS = 6;
  const colors = ref(new Map<string, ImageColor[]>());

  const readColorsFromImageBySrc = (token: MaybeRef<string>, src: MaybeRef<string>) => {
    const img = new Image();

    img.crossOrigin = 'anonymous';
    img.src = unref(src);

    const generatePalette = () => {
      const paletteGeneratorPayload = {
        img,
        colorCount: MIN_COLORS,
      };

      const palette = getPalette(paletteGeneratorPayload);

      if (!palette) return;

      const colorData = palette.map(generateColorData);
      const uniqueColors = _filterOriginalColors(colorData).map(_appendBlankSelectedColor);

      colors.value.set(unref(token), uniqueColors);
      /* ??? */
      img.removeAttribute('src');
      /* ??? */
    };

    img.complete
      ? generatePalette()
      : img.addEventListener('load', generatePalette);
  };

  const setColor = (color: Color, imageColor: ImageColor) => {
    imageColor.selected = color;
  };

  const clearSelectedColor = (targetColor: ImageColor) => {
    targetColor.selected = null;
    return targetColor;
  };

  const clearAllSelectedColors = (token: string) => {
    const target = colors.value.get(token);
    if (!target) return;

    colors.value.set(token, target.map(clearSelectedColor));
  };

  const removeColorCompletely = (token: string, color: ImageColor) => {
    const target = colors.value.get(token);
    if (!target) return;

    const result = target.filter(_color => (_color.original.hex !== color.original.hex));

    colors.value.set(token, result);
  };

  const checkIfSomeColorsAreSelected = (token: string) => {
    const target = colors.value.get(token);
    if (!target) return false;

    return target.some(color => color.selected);
  };

  const amountOfColors = (token: string) => {
    const target = colors.value.get(token);
    if (!target) return 0;

    return target.length;
  };

  const resetColorsStore = () => {
    colors.value.clear();
  };

  return {
    colors,
    MIN_COLORS,
    readColorsFromImageBySrc,
    setColor,
    clearSelectedColor,
    clearAllSelectedColors,
    checkIfSomeColorsAreSelected,
    removeColorCompletely,
    amountOfColors,
    resetColorsStore,
  };
});

function _filterOriginalColors(colors: Color[]): Color[] {
  const uniqueColorsHex = new Set();

  return colors.filter((color) => {
    const original = !uniqueColorsHex.has(color.hex);

    uniqueColorsHex.add(color.hex);

    return original;
  });
}

function _appendBlankSelectedColor(color: Color): ImageColor {
  return {
    original: color,
    selected: null,
  };
}
