<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { usePaletteGeneratorStore } from '../model';
import { ImageCard } from '@/entities/image';

const paletteGeneratorStore = usePaletteGeneratorStore();
const { images } = storeToRefs(paletteGeneratorStore);
</script>

<template>
  <section class="grid grid-cols-12 gap-5">
    <ImageCard
      v-for="[imageKey, image] in images"
      :key="imageKey"
      :image-object="image"
      class="col-span-4"
    />
  </section>
</template>
