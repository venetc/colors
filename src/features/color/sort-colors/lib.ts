import type { ColorScheme, PivotId, SchemeId } from './model';
import type { Color, ColorHex, ImageColor } from '@/entities/color';
import { generateId } from '@/shared/lib/nanoid.ts';
import { generateRandomRgb, getLuminance, hslToCss, rgbToCss, rgbToHSL, rgbToHex } from '@/shared/lib/color';
import type { ImageId } from '@/entities/image';

export function createColorScheme() {
  const rgbArray = generateRandomRgb();
  const hex = rgbToHex(rgbArray) as ColorHex;
  const hsl = hslToCss(rgbArray);
  const rgb = rgbToCss(rgbArray);
  const hslArray = rgbToHSL(rgbArray);
  const luminance = getLuminance(rgbArray);

  const leadColor: Color = {
    rgb,
    hex,
    hsl,
    rgbArray,
    hslArray,
    luminance,
  };

  const id = generateId() as SchemeId;

  const result: ColorScheme = {
    leadColor,
    id,
    colors: new Map<PivotId, ImageColor>(),
  };

  return result;
}

export function generatePivotId(imageId: ImageId, index: number): PivotId {
  return `${imageId}__${index}`;
}

export function readPivotId(pivotId: PivotId) {
  const [imageId, index] = pivotId.split('__') as [ImageId, string];

  const colorIndex = +index;

  return { imageId, colorIndex };
}
