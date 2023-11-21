import { createColorGroup } from '../lib';

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { ImageId } from '@/entities/image';
import type { Color, ColorHex, ImageColor } from '@/entities/color';

import { getLuminance, hexToRGB, hslToCss, rgbToCss, rgbToHSL } from '@/shared/lib/color';

export type ColorGroupId = Brand<Id, 'ColorGroupId'>;
export type PivotId = `${ImageId}__${number}`;

export interface ColorGroup {
  id: ColorGroupId;
  leadColor: Color;
  colors: Map<PivotId, ImageColor>;
}

export const useColorGroups = defineStore('Entities/ColorsGroup', () => {
  const colorGroups = ref<Map<ColorGroupId, ColorGroup>>(new Map());
  const leadColors = ref(new Set<string>());

  const nonEmptyColorGroups = computed(() => {
    return [...colorGroups.value.values()].filter(colorGroup => colorGroup.colors.size > 0);
  });
  const addColorGroup = () => {
    const newGroup = createColorGroup();

    const values = [...colorGroups.value.values()];
    const alreadyInMap = values.some(color => color.leadColor.hex === newGroup.leadColor.hex);

    if (!alreadyInMap) {
      leadColors.value.add(newGroup.leadColor.hex);
      colorGroups.value.set(newGroup.id, newGroup);
    } else {
      addColorGroup();
    }
  };
  const clearColorGroupById = (id: ColorGroupId) => {
    const targetGroup = colorGroups.value.get(id);

    if (!targetGroup) return;

    targetGroup.colors.forEach((imageColor) => {
      imageColor.isSorted = false;
      imageColor.colorGroupId = null;
    });

    targetGroup.colors.clear();
  };
  const deleteColorGroupById = (id: ColorGroupId) => {
    const targetGroup = colorGroups.value.get(id);

    if (!targetGroup) return;

    clearColorGroupById(id);

    leadColors.value.delete(targetGroup.leadColor.hex);
    colorGroups.value.delete(id);
  };
  const changeLeadColor = (hex: ColorHex, id: ColorGroupId) => {
    const targetColorGroup = colorGroups.value.get(id);
    if (!targetColorGroup) return;

    if (leadColors.value.has(hex.toUpperCase())) return;

    leadColors.value.delete(targetColorGroup.leadColor.hex.toUpperCase());

    const rgbArray = hexToRGB(hex.toUpperCase());
    const rgb = rgbToCss(rgbArray);
    const hslArray = rgbToHSL(rgbArray);
    const hsl = hslToCss(hslArray);
    const luminance = getLuminance(rgbArray);

    targetColorGroup.leadColor = {
      hex: hex.toUpperCase() as ColorHex,
      luminance,
      hsl,
      rgb,
      rgbArray,
      hslArray,
    };

    leadColors.value.add(hex.toUpperCase());
  };

  return { colorGroups, nonEmptyColorGroups, addColorGroup, clearColorGroupById, deleteColorGroupById, changeLeadColor };
});
