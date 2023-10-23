import type { PivotId } from './model';
import type { ColorHex, ImageColor } from '@/entities/color';
import type { ImageId } from '@/entities/image';

export function generatePivotId(imageId: ImageId, index: number, imageColor: ImageColor): PivotId {
  return `${imageId}__${index}__${imageColor.original.hex}`;
}

export function readPivotId(pivotId: PivotId) {
  const [imageId, index, colorHex] = pivotId.split('__') as [ImageId, string, ColorHex];

  const colorIndex = +index;

  return { imageId, colorIndex, colorHex };
}
