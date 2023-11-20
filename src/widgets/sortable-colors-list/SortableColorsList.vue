<script setup lang="ts">
import { computed, toRefs } from 'vue';

import type { ColorCollection, ImageColor } from '@/entities/color';
import type { ImageId } from '@/entities/image';

import { SortableColorCell, useColorsSort } from '@/features/sort-colors';
import { generatePivotId } from '@/entities/colors-group';
import { QuickSortInPlace } from '@/shared/lib/sort';

const props = defineProps<{ colors: Map<ImageId, ColorCollection> }>();
const { colors } = toRefs(props);

const flatColors = computed(() => {
  const result: [ImageId, number, ImageColor][] = [];

  colors.value.forEach((colorCollection, imageId) => {
    colorCollection.forEach((imageColor, index) => {
      if (!imageColor) return;

      result.push([imageId, +index, imageColor]);
    });
  });

  // console.time('Sort Colors QS');
  QuickSortInPlace.sort(
    result,
    (a, b) => (b[2].handpicked?.luminance ?? b[2].original.luminance) - (a[2].handpicked?.luminance ?? a[2].original.luminance),
  );
  // console.timeEnd('Sort Colors QS');

  return result;
});

const sortedColorsModel = useColorsSort();
</script>

<template>
  <div>
    <SortableColorCell
      v-for="[imageId, colorIndex, imageColor] in flatColors"
      :key="`${imageColor.imageId}_${imageColor.original.hex}`"
      :imageColor="imageColor"
      @onColorResetClick="sortedColorsModel.removeColorFromGroups(imageId, colorIndex)"
      @onColorDragStart="sortedColorsModel.dragStartHandler({ event: $event, pivotId: generatePivotId(imageId, colorIndex) })"
    />
  </div>
</template>

<style scoped>

</style>
