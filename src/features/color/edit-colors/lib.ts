import type { ImageId } from '@/entities/image';
import type { Color, ImageColor } from '@/entities/color';

export function _filterOriginalColors(colors: Color[]): Color[] {
  const uniqueColorsHex = new Set();

  return colors.filter((color) => {
    const original = !uniqueColorsHex.has(color.hex);

    uniqueColorsHex.add(color.hex);

    return original;
  });
}

export function _appendBlankHandpickedColor(color: Color, imageId: ImageId): ImageColor {
  return {
    imageId,
    isSorted: false,
    original: color,
    handpicked: null,
    schemeId: null,
  };
}
