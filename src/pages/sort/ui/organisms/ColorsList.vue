<script setup lang="ts">
import { computed, toRefs } from 'vue';

import type { ColorCollection, ImageColor } from '@/entities/color';
import type { ImageId } from '@/entities/image';

import { useColorsSort } from '@/features/color/sort-colors';
import { generatePivotId } from '@/entities/colors-group';
import { Comparator, QuickSortInPlace } from '@/shared/lib/sort';
import { ColorsChunkCell } from '@/entities/color';

const props = defineProps<{ colors: Map<ImageId, ColorCollection> }>();
const { colors } = toRefs(props);

const comparator = new Comparator<[ImageId, number, ImageColor]>((a, b) => {
  return (b[2].handpicked?.luminance ?? b[2].original.luminance) - (a[2].handpicked?.luminance ?? a[2].original.luminance);
});

const flatColors = computed(() => {
  const result: [ImageId, number, ImageColor][] = [];

  colors.value.forEach((colorCollection, imageId) => {
    colorCollection.forEach((imageColor, index) => {
      if (!imageColor) return;

      result.push([imageId, +index, imageColor]);
    });
  });

  // console.time('Sort Colors QS');
  QuickSortInPlace.sort(result, comparator);
  // console.timeEnd('Sort Colors QS');

  return result;
});

const sortedColorsModel = useColorsSort();
</script>

<template>
  <div
    dir="ltr"
    class="pb-3.5 pl-9 pt-4 pr-3.5 grid gap-1.5 place-items-start grid-cols-[repeat(2,_2.5rem)] 2xl:grid-cols-[repeat(2,_2.5rem)] xl:grid-cols-[repeat(2,_2rem)] lg:grid-cols-[repeat(2,_1.5rem)]"
  >
    <ColorsChunkCell
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
