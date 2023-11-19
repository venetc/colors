import { createColorGroup } from '../lib';

import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { ImageId } from '@/entities/image';
import type { Color, ImageColor } from '@/entities/color';

export type ColorGroupId = Brand<Id, 'ColorGroupId'>;
export type PivotId = `${ImageId}__${number}`;

export interface ColorGroup {
  id: ColorGroupId;
  leadColor: Color;
  colors: Map<PivotId, ImageColor>;
}

export const useColorGroups = defineStore('Entities/ColorsGroup', () => {
  const colorGroups = ref<Map<ColorGroupId, ColorGroup>>(new Map());

  const addColorGroup = () => {
    const newGroup = createColorGroup();

    const values = [...colorGroups.value.values()];
    const alreadyInMap = values.some(color => color.leadColor.hex === newGroup.leadColor.hex);

    if (!alreadyInMap) {
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

    colorGroups.value.delete(id);
  };

  return { colorGroups, addColorGroup, clearColorGroupById, deleteColorGroupById };
});
