<script setup lang="ts">
import { SortableColorCell } from '../atoms';
import { SortableColorsChunkActions, SortableColorsGrid } from '../molecules';

import { toRefs } from 'vue';

import type { ColorCollection } from '@/entities/color';
import type { ImageId } from '@/entities/image';

import { useImages } from '@/entities/image';
import { useColors } from '@/entities/color';
import { useColorsSort } from '@/features/sort-colors';
import { generatePivotId } from '@/entities/colors-group';

const props = defineProps<{ imageId: ImageId; colorCollection: ColorCollection }>();

const { imageId, colorCollection } = toRefs(props);

const sortedColorsModel = useColorsSort();
const imagesModel = useImages();
const colorsModel = useColors();
</script>

<template>
  <div class="relative">
    <SortableColorsChunkActions
      class="absolute bottom-full left-0 w-full z-20 translate-y-1/2"
      :image="imagesModel.getImageById(imageId)"
      @onReset="sortedColorsModel.unsortColorsByImageId"
    />

    <SortableColorsGrid>
      <SortableColorCell
        v-for="[colorIndex, imageColor] in colorsModel.nonEmptyColorCollection(colorCollection)"
        :key="`${imageColor.imageId}_${imageColor.original.hex}`"
        :imageColor="imageColor"
        @onColorResetClick="sortedColorsModel.removeColorFromGroups(imageId, colorIndex)"
        @onColorDragStart="sortedColorsModel.dragStartHandler({ event: $event, pivotId: generatePivotId(imageId, colorIndex) })"
      />
    </SortableColorsGrid>
  </div>
</template>
