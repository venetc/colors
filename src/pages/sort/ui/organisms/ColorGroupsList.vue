<script setup lang="ts">
import { toRefs } from 'vue';
import { ColorGroup } from '../molecules';
import type { ColorCollection } from '@/entities/color';
import type { ImageId } from '@/entities/image';

const props = defineProps<{ colors: Map<ImageId, ColorCollection> }>();
const { colors } = toRefs(props);
</script>

<template>
  <div
    dir="ltr"
    class="pb-16 pl-7 pr-3.5 grid gap-5"
  >
    <ColorGroup
      v-for="[imageId, colorCollection] in colors"
      :key="imageId"
      :colorCollection="colorCollection"
      :imageId="imageId"
    />
  </div>
</template>
