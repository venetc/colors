import type { Ref } from 'vue';
import { ref } from 'vue';
import { generateColorData } from '@/entities/color';
import { generateRandomRgb } from '@/shared/lib/color';
import { createImageFromFile } from '@/features/image/get-from-image-file';
import { createImageFromLink } from '@/features/image/get-from-links';
import type { ColorCollection } from '@/entities/color';
import type { ImageId, Img } from '@/entities/image';

const DEMO_IMAGE_1: Img = createImageFromFile({
  fileName: 'my_image.jpg',
  blobSrc: '',
});
const DEMO_IMAGE_2: Img = createImageFromLink({
  originalSrc: 'https://test.com/my_image.jpg',
  blobSrc: '',
});
const DEMO_IMAGES_PAYLOAD: Array<[ImageId, Img]> = [
  [DEMO_IMAGE_1.id, DEMO_IMAGE_1],
  [DEMO_IMAGE_2.id, DEMO_IMAGE_2],
];
export const DEMO_IMAGES: Ref<Map<ImageId, Img>> = ref(new Map(DEMO_IMAGES_PAYLOAD));

const DEMO_COLOR_COLLECTION_1: ColorCollection = new Map(Array.from({ length: 2 }).map((_, index) => [index, {
  imageId: DEMO_IMAGE_1.id,
  original: generateColorData(generateRandomRgb()),
  handpicked: null,
  isSorted: false,
  schemeId: null,
}]));
const DEMO_COLOR_COLLECTION_2: ColorCollection = new Map(Array.from({ length: 2 }).map((_, index) => [index, {
  imageId: DEMO_IMAGE_2.id,
  original: generateColorData(generateRandomRgb()),
  handpicked: generateColorData(generateRandomRgb()),
  isSorted: false,
  schemeId: null,
}]));
const DEMO_COLORS_PAYLOAD: Array<[ImageId, ColorCollection]> = [
  [DEMO_IMAGE_1.id, DEMO_COLOR_COLLECTION_1],
  [DEMO_IMAGE_2.id, DEMO_COLOR_COLLECTION_2],
];

export const DEMO_COLORS: Ref<Map<ImageId, ColorCollection>> = ref(new Map(DEMO_COLORS_PAYLOAD));
