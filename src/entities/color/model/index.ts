import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Color } from '../lib';
import { generateColorObject, getPalette } from '../lib';

interface ImageColor {
  original: Color;
  manuallySelected: Color | undefined;
}

export const useColorsStore = defineStore('ColorsStore', () => {
  const colors = ref(new Map<string, ImageColor[]>());

  const grabColorsFromSrc = (payload: { token: string; src: string }) => {
    const {
      token,
      src,
    } = payload;
    const img = new Image();

    img.crossOrigin = 'anonymous';
    img.src = src;

    const generatePalette = () => {
      const palette = getPalette({ img })
        .map(color => ({
          original: generateColorObject(color),
          manuallySelected: undefined,
        }));

      colors.value.set(token, palette);
    };

    img.complete
      ? generatePalette()
      : img.addEventListener('load', generatePalette);
  };

  return {
    colors,
    grabColorsFromSrc,
  };
});
