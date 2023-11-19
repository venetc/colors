<script setup lang="ts">
import { ColorGroupActions, ColorGroupGrid } from '../atoms';

import { toRefs } from 'vue';

import type { ColorCollection, ImageColor } from '@/entities/color';
import type { ImageId } from '@/entities/image';

import { useColorsSort } from '@/features/color/sort-colors';
import { generatePivotId } from '@/entities/colors-group';
import { ColorsChunkCell } from '@/entities/color';

const props = defineProps<{ imageId: ImageId; colorCollection: ColorCollection }>();
const { imageId, colorCollection } = toRefs(props);

function getNonEmptyColors(colorCollection: ColorCollection) {
  return [...colorCollection.entries()].filter((collection): collection is [number, ImageColor] => (collection[1] !== null));
}

const sortedColorsModel = useColorsSort();
</script>

<template>
  <div class="relative">
    <ColorGroupActions
      :imageId="imageId"
      class="absolute bottom-full left-0 w-full z-20 translate-y-1/2"
    />

    <ColorGroupGrid>
      <ColorsChunkCell
        v-for="[colorIndex, imageColor] in getNonEmptyColors(colorCollection)"
        :key="`${imageColor.imageId}_${imageColor.original.hex}`"
        :imageColor="imageColor"
        @onColorResetClick="sortedColorsModel.removeColorFromGroups(imageId, colorIndex)"
        @onColorDragStart="sortedColorsModel.dragStartHandler({ event: $event, pivotId: generatePivotId(imageId, colorIndex) })"
      />
    </ColorGroupGrid>
  </div>
</template>
