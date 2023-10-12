import { defineStore, storeToRefs } from 'pinia';
import { ref } from 'vue';
import type { Color, ImageColor } from '@/entities/color';
import { useColorsStore } from '@/entities/color';

export interface ColorObject {
  source: string;
  color: Color;
}

export function generateColorObjectsFromMapEntity(mapEntity: [string, ImageColor[]]): ColorObject[] {
  const [source, imageColors] = mapEntity;

  const filteredColors = imageColors.map(color => (color.selected ?? color.original));
  return filteredColors.map(color => ({
    source,
    color,
  }));
}

export const useSortedColorsStore = defineStore('SortedColorsStore', () => {
  const colorObjects = ref<ColorObject[][]>([]);

  const colorsStore = useColorsStore();
  const { colors } = storeToRefs(colorsStore);

  const generateColorObjects = () => {
    colorObjects.value = [...colors.value.entries()].map(generateColorObjectsFromMapEntity);
  };

  return {
    colorObjects,
    generateColorObjects,
  };
});
