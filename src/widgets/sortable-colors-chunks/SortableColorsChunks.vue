<script setup lang="ts">
import { toRefs } from 'vue';

import type { ColorCollection } from '@/entities/color';
import type { ImageId } from '@/entities/image';

import { SortableColorsChunk } from '@/features/sort-colors';

const props = defineProps<{ colors: Map<ImageId, ColorCollection> }>();
const { colors } = toRefs(props);
</script>

<template>
  <div>
    <SortableColorsChunk
      v-for="[imageId, colorCollection] in colors"
      :key="imageId"
      :colorCollection="colorCollection"
      :imageId="imageId"
    />
  </div>
</template>
