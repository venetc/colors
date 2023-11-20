import { ref } from 'vue';

import type { Ref } from 'vue';
import type { ColorGroup, ColorGroupId, PivotId } from '@/entities/colors-group';
import type { ColorCollection, ImageColor } from '@/entities/color';
import type { ImageId, Img } from '@/entities/image';

import { createImageFromLink } from '@/features/get-image-from-links';
import { createImageFromFile } from '@/features/get-image-from-file';
import { createColorGroup } from '@/entities/colors-group';
import { generateColorData } from '@/entities/color';
import { generateRandomRgb } from '@/shared/lib/color';

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
const DEMO_FILE_IMAGES_PAYLOAD: Array<[ImageId, Img]> = [
  [DEMO_IMAGE_1.id, DEMO_IMAGE_1],
];
const DEMO_LINK_IMAGES_PAYLOAD: Array<[ImageId, Img]> = [
  [DEMO_IMAGE_2.id, DEMO_IMAGE_2],
];

export const DEMO_IMAGES: Ref<Map<ImageId, Img>> = ref(new Map(DEMO_IMAGES_PAYLOAD));
export const DEMO_FILE_IMAGES: Ref<Map<ImageId, Img>> = ref(new Map(DEMO_FILE_IMAGES_PAYLOAD));
export const DEMO_LINK_IMAGES: Ref<Map<ImageId, Img>> = ref(new Map(DEMO_LINK_IMAGES_PAYLOAD));

const DEMO_GROUP = createColorGroup();

const DEMO_IMAGE_COLOR_1: ImageColor = {
  imageId: DEMO_IMAGE_1.id,
  original: generateColorData(generateRandomRgb()),
  handpicked: null,
  isSorted: true,
  colorGroupId: DEMO_GROUP.id,
};
const DEMO_IMAGE_COLOR_2: ImageColor = {
  imageId: DEMO_IMAGE_2.id,
  original: generateColorData(generateRandomRgb()),
  handpicked: generateColorData(generateRandomRgb()),
  isSorted: true,
  colorGroupId: DEMO_GROUP.id,
};

DEMO_GROUP.colors.set(`${DEMO_IMAGE_COLOR_1.imageId}_${0}` as PivotId, DEMO_IMAGE_COLOR_1);
DEMO_GROUP.colors.set(`${DEMO_IMAGE_COLOR_2.imageId}_${1}` as PivotId, DEMO_IMAGE_COLOR_2);

const DEMO_COLOR_COLLECTION_1: ColorCollection = new Map(Array.from({ length: 2 }).map((_, index) => [index, DEMO_IMAGE_COLOR_1]));
const DEMO_COLOR_COLLECTION_2: ColorCollection = new Map(Array.from({ length: 2 }).map((_, index) => [index, DEMO_IMAGE_COLOR_2]));
const DEMO_COLORS_PAYLOAD: Array<[ImageId, ColorCollection]> = [
  [DEMO_IMAGE_1.id, DEMO_COLOR_COLLECTION_1],
  [DEMO_IMAGE_2.id, DEMO_COLOR_COLLECTION_2],
];

export const DEMO_COLORS: Ref<Map<ImageId, ColorCollection>> = ref(new Map(DEMO_COLORS_PAYLOAD));

const DEMO_GROUPS_PAYLOAD: Array<[ColorGroupId, ColorGroup]> = [
  [DEMO_GROUP.id, DEMO_GROUP],
];

export const DEMO_COLOR_GROUPS: Ref<Map<ColorGroupId, ColorGroup>> = ref(new Map(DEMO_GROUPS_PAYLOAD));
