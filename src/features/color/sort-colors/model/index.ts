import { defineStore, storeToRefs } from 'pinia';
import { ref } from 'vue';
import { readPivotId } from '@/features/color/sort-colors';
import { useColorsStore } from '@/entities/color';
import type { ImageId } from '@/entities/image';
import { generateRandomRgb, getBrightness, hslToCss, rgbToCss, rgbToHSL, rgbToHex } from '@/shared/lib/color';
import type { Color, ColorHex, ImageColor } from '@/entities/color';
import { generateId } from '@/shared/lib/nanoid';

export type SchemeId = Brand<Id, 'SchemeId'>;
export type PivotId = `${ImageId}__${number}__${ColorHex}`;

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

  const addColorScheme = () => {
    const rgbArray = generateRandomRgb();
    const hex = rgbToHex(rgbArray) as ColorHex;

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
  const deleteColorSchemeByToken = (id: SchemeId) => {
    const targetScheme = colorSchemes.value.get(id);

    if (!targetScheme) return;

    targetScheme.colors.forEach((color, pivotId: PivotId) => {
      const { imageId } = readPivotId(pivotId);

      const targetColors = colors.value.get(imageId);

      if (!targetColors) return;

      targetColors.forEach((_color) => {
        if (_color.original.hex === color.original.hex) _color.isSorted = false;
      });
    });

    colorSchemes.value.delete(id);
  };

  const dragStartHandler = ({ event, pivotId, originSchemaId }: DragStartPayload) => {
    if (!event.dataTransfer) return;

    event.dataTransfer.clearData();

    const payload = { pivotId, originSchemaId: originSchemaId ?? null } as {
      pivotId: PivotId;
      originSchemaId: SchemeId | null;
    };

    event.dataTransfer.setData('text/plain', JSON.stringify(payload));
  };

  const dropHandler = ({ event, targetSchemaId }: DropPayload) => {
    if (!event.dataTransfer) return;

    const colorTransferData = JSON.parse(event.dataTransfer.getData('text')) as {
      pivotId: PivotId;
      originSchemaId: SchemeId | null;
    };

    const { pivotId, originSchemaId } = colorTransferData;

    if (targetSchemaId === originSchemaId) return;

    const [imageId, colorIndex] = pivotId.split('__') as [ImageId, number, ColorHex];

    const imageColor = colors.value.get(imageId);
    if (!imageColor) return;
    const targetColor = imageColor[colorIndex];
    const alreadySorted = targetColor.isSorted;

    if (alreadySorted && targetSchemaId && !originSchemaId) {
      colorSchemes.value.forEach((scheme, schemeId) => {
        const alreadyInScheme = scheme.colors.get(pivotId);
        const notTargetScheme = targetSchemaId !== schemeId;
        if (alreadyInScheme && notTargetScheme) scheme.colors.delete(pivotId);
      });
    }

    if (!targetSchemaId) targetColor.isSorted = false;

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
    }

    event.dataTransfer.clearData();
  };

  const invalidateSchemes = () => {
    colorSchemes.value.forEach((scheme) => {
      scheme.colors.forEach((colorFromScheme, pivotId) => {
        const { imageId } = readPivotId(pivotId);

        if (!colorFromScheme.isSorted) {
          scheme.colors.delete(pivotId);
        }

        const targetColors = colors.value.get(imageId);

        if (targetColors) {
          const originalHexMatch = targetColors.find((_color) => {
            return colorFromScheme.original.hex === _color.original.hex;
          });

          if (originalHexMatch) {
            if (originalHexMatch.handpicked?.hex !== colorFromScheme.handpicked?.hex) {
              scheme.colors.delete(pivotId);
              originalHexMatch.isSorted = false;
            } else {
              originalHexMatch.isSorted = originalHexMatch.handpicked?.hex === colorFromScheme.handpicked?.hex;
            }
          }
        } else {
          scheme.colors.delete(pivotId);
        }
      });
    });
  };
  return {
    colorSchemes,
    addColorScheme,
    deleteColorSchemeByToken,
    dragStartHandler,
    dropHandler,
    invalidateSchemes,
  };
});
