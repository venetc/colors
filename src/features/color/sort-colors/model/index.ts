import { defineStore, storeToRefs } from 'pinia';
import { ref } from 'vue';
import { generateRandomRgb, getBrightness, hslToCss, rgbToCss, rgbToHSL, rgbToHex } from '@/shared/lib/color';
import type { Color, ImageColor } from '@/entities/color';
import { useColorsStore } from '@/entities/color';

export interface ColorObject {
  source: string;
  color: Color;
}

export interface ColorScheme {
  leadColor: Color;
  colors: Color[];
}

export const useSortedColorsStore = defineStore('SortedColorsStore', () => {
  const colorObjects = ref<ColorObject[][]>([]);
  const colorSchemes = ref<Map<string, ColorScheme>>(new Map());

  const colorsStore = useColorsStore();
  const { colors } = storeToRefs(colorsStore);

  const generateColorObjects = () => {
    colorObjects.value = [...colors.value.entries()].map(generateColorObjectsFromMapEntity);
  };

  const addColorScheme = () => {
    const rgbArray = generateRandomRgb();
    const hex = rgbToHex(rgbArray);

    const alreadyInMap = colorSchemes.value.get(hex);

    if (!alreadyInMap) {
      const hsl = hslToCss(rgbArray);
      const rgb = rgbToCss(rgbArray);
      const hslArray = rgbToHSL(rgbArray);
      const brightness = getBrightness(rgbArray);

      const leadColor: Color = {
        rgb,
        hex,
        hsl,
        rgbArray,
        hslArray,
        brightness,
      };

      const result: ColorScheme = {
        leadColor,
        colors: [],
      };

      colorSchemes.value.set(leadColor.hex, result);
    } else {
      addColorScheme();
    }
  };

  const deleteColorSchemeByToken = (token: string) => {
    colorSchemes.value.delete(token);
  };

  return {
    colorObjects,
    colorSchemes,
    generateColorObjects,
    addColorScheme,
    deleteColorSchemeByToken,
  };
});

export function generateColorObjectsFromMapEntity(mapEntity: [string, ImageColor[]]): ColorObject[] {
  const [source, imageColors] = mapEntity;

  const filteredColors = imageColors.map(color => (color.selected ?? color.original));
  return filteredColors.map(color => ({
    source,
    color,
  }));
}
