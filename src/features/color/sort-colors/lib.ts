import type { PivotId } from './model';
import type { ImageId } from '@/entities/image';

export function generatePivotId(imageId: ImageId, index: number): PivotId {
  return `${imageId}__${index}`;
}

export function readPivotId(pivotId: PivotId) {
  const [imageId, index] = pivotId.split('__') as [ImageId, string];

  const colorIndex = +index;

  return { imageId, colorIndex };
}
