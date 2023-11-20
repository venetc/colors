import { defineStore, storeToRefs } from 'pinia';
import { nextTick } from 'vue';

import type { ColorGroupId, PivotId } from '@/entities/colors-group';
import type { ImageId } from '@/entities/image';

import { generatePivotId, readPivotId, useColorGroups } from '@/entities/colors-group';
import { useColors } from '@/entities/color';
import { getDeltaE00, rgbToXyz, xyzToLab } from '@/shared/lib/color.ts';

interface DragStartPayload {
  event: DragEvent;
  pivotId: PivotId;
  originGroupId?: ColorGroupId;
}

interface DropPayload {
  event: DragEvent;
  targetGroupId?: ColorGroupId;
}

export const useColorsSort = defineStore('Features/SortColors', () => {
  const colorsModel = useColors();
  const colorGroupsModel = useColorGroups();

  const { colors } = storeToRefs(colorsModel);
  const { colorGroups } = storeToRefs(colorGroupsModel);

  const dragStartHandler = async (args: DragStartPayload) => {
    const {
      event,
      pivotId,
      originGroupId,
    } = args;
    await nextTick();
    if (!event.dataTransfer) return;

    event.dataTransfer.clearData();

    const payload = {
      pivotId,
      originColorGroupId: originGroupId ?? null,
    } as {
      pivotId: PivotId;
      originColorGroupId: ColorGroupId | null;
    };

    event.dataTransfer.setData('text/plain', JSON.stringify(payload));
  };
  const dropHandler = async (args: DropPayload) => {
    const {
      event,
      targetGroupId,
    } = args;
    await nextTick();

    if (!event.dataTransfer) return;

    try {
      const colorTransferData = JSON.parse(event.dataTransfer.getData('text')) as {
        pivotId: PivotId;
        originColorGroupId: ColorGroupId | null;
      };

      const {
        pivotId,
        originColorGroupId,
      } = colorTransferData;

      if (targetGroupId === originColorGroupId) return;

      const {
        imageId,
        colorIndex: i,
      } = readPivotId(pivotId);

      const index = +i;

      const imageColor = colors.value.get(imageId);
      if (!imageColor) return;

      const targetColor = imageColor.get(index);
      if (!targetColor) return;

      const alreadySorted = targetColor.isSorted;

      if (alreadySorted && targetGroupId && !originColorGroupId) {
        colorGroups.value.forEach((colorGroup, colorGroupId) => {
          const alreadyInGroup = colorGroup.colors.get(pivotId);
          const notTargetGroup = targetGroupId !== colorGroupId;
          if (alreadyInGroup && notTargetGroup) colorGroup.colors.delete(pivotId);
        });
      }

      if (!targetGroupId) {
        targetColor.isSorted = false;
        targetColor.colorGroupId = null;
      }

      if (originColorGroupId) {
        const originColorGroup = colorGroups.value.get(originColorGroupId);
        if (!originColorGroup) return;

        originColorGroup.colors.delete(pivotId);
      }

      if (targetGroupId) {
        const target = colorGroups.value.get(targetGroupId);
        if (!target) return;

        target.colors.set(pivotId, targetColor);
        targetColor.isSorted = true;
        targetColor.colorGroupId = targetGroupId;
      }
    } catch (e) {
      console.log(e);
    } finally {
      event.dataTransfer.clearData();
    }
  };
  const invalidateColorGroups = () => {
    colorGroups.value.forEach((colorGroup, colorGroupId) => {
      colorGroup.colors.forEach((colorFromGroup, pivotId) => {
        const {
          imageId,
          colorIndex,
        } = readPivotId(pivotId);
        const indexOfColor = +colorIndex;

        if (!colorFromGroup.isSorted) {
          colorGroup.colors.delete(pivotId);
          return;
        }

        const targetColorsFromPool = colors.value.get(imageId);

        if (!targetColorsFromPool) {
          colorGroup.colors.delete(pivotId);
          return;
        }

        const colorFromPool = colorsModel.getColorFromPool(imageId, indexOfColor);

        if (!colorFromPool) {
          colorGroup.colors.delete(pivotId);
          return;
        }

        const sameOriginalHex = colorFromPool.original.hex === colorFromGroup.original.hex;
        const sameHandpickedHex = colorFromPool.handpicked?.hex === colorFromGroup.handpicked?.hex;

        if (sameOriginalHex && sameHandpickedHex) {
          colorFromPool.isSorted = true;
          colorFromPool.colorGroupId = colorGroupId;
        } else {
          colorGroup.colors.delete(pivotId);
        }
      });
    });
  };
  const removeColorFromGroups = (imageId: ImageId, colorIndex: number) => {
    const pivotId = generatePivotId(imageId, colorIndex);

    const colorFromPool = colorsModel.getColorFromPool(imageId, colorIndex);

    if (colorFromPool) {
      colorFromPool.isSorted = false;
      colorFromPool.colorGroupId = null;
    }

    colorGroups.value.forEach((colorGroup) => {
      colorGroup.colors.delete(pivotId);
    });
  };
  const unsortColorsByImageId = (imageId: ImageId) => {
    const colorsFromPool = colors.value.get(imageId);

    if (!colorsFromPool) return;

    colorsFromPool.forEach((color, index) => {
      if (!color) return;

      removeColorFromGroups(imageId, +index);
    });
  };
  const resetSorting = () => {
    colorGroups.value.forEach((colorGroup) => {
      colorGroup.colors.forEach((_, pivotId, colorGroup) => {
        const {
          imageId,
          colorIndex,
        } = readPivotId(pivotId);

        const targetCollection = colors.value.get(imageId);
        if (!targetCollection) return;

        const targetColor = targetCollection.get(+colorIndex);
        if (!targetColor) return;

        targetColor.isSorted = false;
        targetColor.colorGroupId = null;

        colorGroup.delete(pivotId);
      });
    });

    colors.value.forEach((collection) => {
      collection.forEach((color) => {
        if (!color) return;
        color.isSorted = false;
        color.colorGroupId = null;
      });
    });
  };
  const autoSort = () => {
    if (colorGroups.value.size < 1) return;

    colors.value.forEach((colorCollection, imageId) => {
      if (!colorCollection) return;

      colorCollection.forEach((imageColor, index) => {
        if (!imageColor) return;

        const pivotId = generatePivotId(imageId, +index);

        const _color = imageColor.handpicked ?? imageColor.original;
        const colorLab = xyzToLab(rgbToXyz(_color.rgbArray));

        let closestColorGroup: { similarity: number; colorGroupId: ColorGroupId } | undefined;

        colorGroups.value.forEach((colorGroup, colorGroupId) => {
          const lab = xyzToLab(rgbToXyz(colorGroup.leadColor.rgbArray));

          const deltaE = getDeltaE00(colorLab, lab);

          if (!closestColorGroup || deltaE <= closestColorGroup.similarity) closestColorGroup = {
            similarity: deltaE,
            colorGroupId,
          };
        });

        if (!closestColorGroup) return;

        const targetGroup = colorGroups.value.get(closestColorGroup.colorGroupId);
        if (!targetGroup) return;

        const oldColorGroup = imageColor.colorGroupId;
        if (oldColorGroup && oldColorGroup !== closestColorGroup.colorGroupId) {
          const colorGroupToUpdate = colorGroups.value.get(oldColorGroup);
          if (colorGroupToUpdate) colorGroupToUpdate.colors.delete(pivotId);
        }

        targetGroup.colors.set(pivotId, imageColor);
        imageColor.isSorted = true;
        imageColor.colorGroupId = closestColorGroup.colorGroupId;
      });
    });
  };

  return {
    dragStartHandler,
    dropHandler,
    invalidateColorGroups,
    removeColorFromGroups,
    unsortColorsByImageId,
    resetSorting,
    autoSort,
  };
});
