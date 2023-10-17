import { defineStore, storeToRefs } from 'pinia';
import { ref } from 'vue';
import type { Img } from '@/entities/image';
import { useImagesStore } from '@/entities/image';
import { generateUUID } from '@/shared/lib/string.ts';
import { generateRandomRgb, getBrightness, hslToCss, rgbToCss, rgbToHSL, rgbToHex } from '@/shared/lib/color';
import type { Color, ImageColor } from '@/entities/color';
import { useColorsStore } from '@/entities/color';

export interface ColorObject {
  source: string;
  color: Color;
}

export interface ColorScheme {
  leadColor: Color;
  colors: Map<string, Color>;
}

export const useSortedColorsStore = defineStore('SortedColorsStore', () => {
  const colorObjects = ref<Map<Img, ImageColor[]>>(new Map());
  const colorSchemes = ref<Map<string, ColorScheme>>(new Map());

  const generateColorObjects = () => {
    const colorsStore = useColorsStore();
    const imagesStore = useImagesStore();

    const { colors } = storeToRefs(colorsStore);
    const { images } = storeToRefs(imagesStore);

    // console.log(colors.value);
    // console.log(images.value);

    colors.value.forEach((imageColor, sourceToken) => {
      const parentImage = images.value.get(sourceToken);

      if (!parentImage) return;

      colorObjects.value.set(parentImage, imageColor);
    });

    // colorObjects.value = [...colors.value.entries()].map(generateColorObjectsFromMapEntity);
  };

  const addColorScheme = () => {
    const rgbArray = generateRandomRgb();
    const hex = rgbToHex(rgbArray);

    const values = [...colorSchemes.value.values()];
    const alreadyInMap = values.some(color => color.leadColor.hex === hex);

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
        colors: new Map<string, Color>(),
      };

      const uuid = generateUUID();

      colorSchemes.value.set(uuid, result);
    } else {
      addColorScheme();
    }
  };

  const deleteColorSchemeByToken = (uuid: string) => {
    colorSchemes.value.delete(uuid);
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

  return imageColors.map((imageColor) => {
    const color = imageColor.selected ?? imageColor.original;

    return {
      source,
      color,
    };
  });
}
