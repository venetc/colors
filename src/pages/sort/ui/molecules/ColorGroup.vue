<script setup lang="ts">
import { toRefs } from 'vue';
import { ColorGroupActions, ColorGroupCell, ColorGroupGrid } from '../atoms';
import type { ColorCollection, ImageColor } from '@/entities/color';
import type { ImageId } from '@/entities/image';

const props = defineProps<{ imageId: ImageId; colorCollection: ColorCollection }>();
const { imageId, colorCollection } = toRefs(props);

function getNonEmptyColors(colorCollection: ColorCollection) {
  return [...colorCollection.entries()].filter(([_, value]) => (value !== null)) as Array<[number, ImageColor]>;
}
</script>

<template>
  <div class="relative">
    <ColorGroupActions
      :imageId="imageId"
      class="absolute bottom-full left-0 w-full z-20 translate-y-1/2"
    />

    <ColorGroupGrid>
      <ColorGroupCell
        v-for="[colorIndex, imageColor] in getNonEmptyColors(colorCollection)"
        :key="`${imageColor.imageId}_${imageColor.original.hex}`"
        :imageId="imageId"
        :colorIndex="colorIndex"
        :imageColor="imageColor"
      />
    </ColorGroupGrid>
  </div>
</template>
