<script setup lang="ts">
import { toRefs } from 'vue';
import type { ImageColor } from '../model';

const props = defineProps<{ color: ImageColor }>();
const { color } = toRefs(props);
</script>

<template>
  <div class="w-full h-full relative group/cell cursor-pointer">
    <div
      class="border-black border-2 border-opacity-100 absolute w-full h-full top-0 left-0 rounded transition-all"
      :class="{ 'group-hover/cell:-translate-y-1 group-hover/cell:-translate-x-1': color.handpicked }"
      :style="{ backgroundColor: color.original.hex }"
    />

    <div
      class="border-black border-2 border-opacity-100 absolute w-full h-full top-0 left-0 rounded transition-all"
      :class="{ 'group-hover/cell:translate-y-1 group-hover/cell:translate-x-1': color.handpicked }"
      :style="{ backgroundColor: color.handpicked ? color.handpicked.hex : 'transparent' }"
    />
  </div>
</template>
