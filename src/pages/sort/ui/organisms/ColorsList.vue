<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { ColorGroupCell } from '../atoms';
import type { ColorCollection, ImageColor } from '@/entities/color';
import type { ImageId } from '@/entities/image';

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

  return result.sort((a, b) => {
    const [, , colorA] = a;
    const [, , colorB] = b;

    const luminanceA = colorA.handpicked?.luminance ?? colorA.original.luminance;
    const luminanceB = colorB.handpicked?.luminance ?? colorB.original.luminance;

    return luminanceB - luminanceA;
  });
});
</script>

<template>
  <div
    dir="ltr"
    class="pb-3.5 pl-9 pt-4 pr-3.5 grid gap-1.5 place-items-start grid-cols-[repeat(2,_2.5rem)] 2xl:grid-cols-[repeat(2,_2.5rem)] xl:grid-cols-[repeat(2,_2rem)] lg:grid-cols-[repeat(2,_1.5rem)]"
  >
    <ColorGroupCell
      v-for="[imageId, colorIndex, imageColor] in flatColors"
      :key="`${imageColor.imageId}_${imageColor.original.hex}`"
      :imageId="imageId"
      :colorIndex="colorIndex"
      :imageColor="imageColor"
    />
  </div>
</template>

<style scoped>

</style>
