import { defineStore, storeToRefs } from 'pinia';
import { nextTick, ref } from 'vue';
import { generatePivotId, readPivotId } from '@/features/color/sort-colors';
import { useColorsStore } from '@/entities/color';
import type { ImageId } from '@/entities/image';
import {
  generateRandomRgb,
  getBrightness,
  getDeltaE00,
  getLuminance,
  hslToCss,
  rgbToCss, rgbToHSL, rgbToHex, rgbToXyz, xyzToLab,
} from '@/shared/lib/color';
import type { Color, ColorHex, ImageColor } from '@/entities/color';
import { generateId } from '@/shared/lib/nanoid';

export type SchemeId = Brand<Id, 'SchemeId'>;
export type PivotId = `${ImageId}__${number}`;

export interface ColorScheme {
  id: SchemeId;
  leadColor: Color;
  colors: Map<PivotId, ImageColor>;
}

interface DragStartPayload {
  event: DragEvent;
  originSchemaId?: SchemeId;
  pivotId: PivotId;
}

interface DropPayload {
  event: DragEvent;
  targetSchemaId?: SchemeId;
}

export const useSortedColorsStore = defineStore('SortedColorsStore', () => {
  const colorSchemes = ref<Map<SchemeId, ColorScheme>>(new Map());

  const colorsStore = useColorsStore();

  const { colors } = storeToRefs(colorsStore);

  const clearColorSchemeById = (id: SchemeId) => {
    const targetScheme = colorSchemes.value.get(id);

    if (!targetScheme) return;

    targetScheme.colors.forEach((_, pivotId: PivotId) => {
      const {
        imageId,
        colorIndex,
      } = readPivotId(pivotId);

      const colorsFromPool = colors.value.get(imageId);

      if (!colorsFromPool) return;

      const color = colorsFromPool.get(colorIndex);

      if (!color) return;

      color.isSorted = false;
      color.schemeId = null;
    });

    targetScheme.colors.clear();
  };
  const addColorScheme = () => {
    const rgbArray = generateRandomRgb();
    const hex = rgbToHex(rgbArray) as ColorHex;

    const values = [...colorSchemes.value.values()];
    const alreadyInMap = values.some(color => color.leadColor.hex === hex);

    if (!alreadyInMap) {
      const hsl = hslToCss(rgbArray);
      const rgb = rgbToCss(rgbArray);
      const hslArray = rgbToHSL(rgbArray);
      const luminance = getLuminance(rgbArray);
      const brightness = getBrightness(rgbArray);

      const leadColor: Color = {
        rgb,
        hex,
        hsl,
        rgbArray,
        hslArray,
        luminance,
        brightness,
      };

      const id = generateId() as SchemeId;

      const result: ColorScheme = {
        leadColor,
        id,
        colors: new Map<PivotId, ImageColor>(),
      };

      colorSchemes.value.set(id, result);
    } else {
      addColorScheme();
    }
  };
  const deleteColorSchemeById = (id: SchemeId) => {
    const targetScheme = colorSchemes.value.get(id);

    if (!targetScheme) return;

    clearColorSchemeById(id);

    colorSchemes.value.delete(id);
  };

  const dragStartHandler = async (args: DragStartPayload) => {
    const {
      event,
      pivotId,
      originSchemaId,
    } = args;
    await nextTick();
    if (!event.dataTransfer) return;

    event.dataTransfer.clearData();

    const payload = {
      pivotId,
      originSchemaId: originSchemaId ?? null,
    } as {
      pivotId: PivotId;
      originSchemaId: SchemeId | null;
    };

    event.dataTransfer.setData('text/plain', JSON.stringify(payload));
  };

  const dropHandler = async (args: DropPayload) => {
    const {
      event,
      targetSchemaId,
    } = args;
    await nextTick();

    if (!event.dataTransfer) return;

    try {
      const colorTransferData = JSON.parse(event.dataTransfer.getData('text')) as {
        pivotId: PivotId;
        originSchemaId: SchemeId | null;
      };

      const {
        pivotId,
        originSchemaId,
      } = colorTransferData;

      if (targetSchemaId === originSchemaId) return;

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

      if (alreadySorted && targetSchemaId && !originSchemaId) {
        colorSchemes.value.forEach((scheme, schemeId) => {
          const alreadyInScheme = scheme.colors.get(pivotId);
          const notTargetScheme = targetSchemaId !== schemeId;
          if (alreadyInScheme && notTargetScheme) scheme.colors.delete(pivotId);
        });
      }

      if (!targetSchemaId) {
        targetColor.isSorted = false;
        targetColor.schemeId = null;
      }

      if (originSchemaId) {
        const originSchema = colorSchemes.value.get(originSchemaId);
        if (!originSchema) return;

        originSchema.colors.delete(pivotId);
      }

      if (targetSchemaId) {
        const target = colorSchemes.value.get(targetSchemaId);
        if (!target) return;

        target.colors.set(pivotId, targetColor);
        targetColor.isSorted = true;
        targetColor.schemeId = targetSchemaId;
      }
    } catch (e) {
      console.log(e);
    } finally {
      event.dataTransfer.clearData();
    }
  };

  const invalidateSchemes = () => {
    colorSchemes.value.forEach((scheme, schemeId) => {
      scheme.colors.forEach((colorFromScheme, pivotId) => {
        const {
          imageId,
          colorIndex,
        } = readPivotId(pivotId);
        const indexOfColor = +colorIndex;

        if (!colorFromScheme.isSorted) {
          scheme.colors.delete(pivotId);
          return;
        }

        const targetColorsFromPool = colors.value.get(imageId);

        if (!targetColorsFromPool) {
          scheme.colors.delete(pivotId);
          return;
        }

        const colorFromPool = colorsStore.getColorFromPool(imageId, indexOfColor);

        if (!colorFromPool) {
          scheme.colors.delete(pivotId);
          return;
        }

        const sameOriginalHex = colorFromPool.original.hex === colorFromScheme.original.hex;
        const sameHandpickedHex = colorFromPool.handpicked?.hex === colorFromScheme.handpicked?.hex;

        if (sameOriginalHex && sameHandpickedHex) {
          colorFromPool.isSorted = true;
          colorFromPool.schemeId = schemeId;
        } else {
          scheme.colors.delete(pivotId);
        }
      });
    });
  };

  const removeColorFromSchemes = (imageId: ImageId, colorIndex: number) => {
    const pivotId = generatePivotId(imageId, colorIndex);

    const colorFromPool = colorsStore.getColorFromPool(imageId, colorIndex);

    if (colorFromPool) {
      colorFromPool.isSorted = false;
      colorFromPool.schemeId = null;
    }

    colorSchemes.value.forEach((scheme) => {
      scheme.colors.delete(pivotId);
    });
  };

  const sortOutColorsByImageId = (imageId: ImageId) => {
    const colorsFromPool = colors.value.get(imageId);

    if (!colorsFromPool) return;

    colorsFromPool.forEach((color, index) => {
      if (!color) return;

      removeColorFromSchemes(imageId, +index);
    });
  };

  const resetSorting = () => {
    colorSchemes.value.forEach((scheme) => {
      scheme.colors.forEach((_, pivotId, colorScheme) => {
        const {
          imageId,
          colorIndex,
        } = readPivotId(pivotId);

        const targetCollection = colors.value.get(imageId);
        if (!targetCollection) return;

        const targetColor = targetCollection.get(+colorIndex);
        if (!targetColor) return;

        targetColor.isSorted = false;
        targetColor.schemeId = null;

        colorScheme.delete(pivotId);
      });
    });

    colors.value.forEach((collection) => {
      collection.forEach((color) => {
        if (!color) return;
        color.isSorted = false;
        color.schemeId = null;
      });
    });
  };

  const autoSort = () => {
    if (colorSchemes.value.size < 1) return;

    colors.value.forEach((colorCollection, imageId) => {
      if (!colorCollection) return;

      colorCollection.forEach((imageColor, index) => {
        if (!imageColor) return;

        const pivotId = generatePivotId(imageId, +index);

        const _color = imageColor.handpicked ?? imageColor.original;
        const colorLab = xyzToLab(rgbToXyz(_color.rgbArray));

        let closestScheme: { similarity: number; schemeId: SchemeId } | undefined;

        colorSchemes.value.forEach((scheme, schemeId) => {
          const lab = xyzToLab(rgbToXyz(scheme.leadColor.rgbArray));

          const deltaE = getDeltaE00(colorLab, lab);

          if (!closestScheme || deltaE <= closestScheme.similarity) closestScheme = {
            similarity: deltaE,
            schemeId,
          };
        });

        if (!closestScheme) return;

        const targetScheme = colorSchemes.value.get(closestScheme.schemeId);
        if (!targetScheme) return;

        const oldScheme = imageColor.schemeId;
        if (oldScheme && oldScheme !== closestScheme.schemeId) {
          const schemeToUpdate = colorSchemes.value.get(oldScheme);
          if (schemeToUpdate) schemeToUpdate.colors.delete(pivotId);
        }

        targetScheme.colors.set(pivotId, imageColor);
        imageColor.isSorted = true;
        imageColor.schemeId = closestScheme.schemeId;
      });
    });
  };

  return {
    colorSchemes,
    addColorScheme,
    deleteColorSchemeById,
    clearColorSchemeById,
    dragStartHandler,
    dropHandler,
    invalidateSchemes,
    removeColorFromSchemes,
    sortOutColorsByImageId,
    resetSorting,
    autoSort,
  };
});
