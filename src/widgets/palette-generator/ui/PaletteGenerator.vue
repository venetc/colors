<script setup lang="ts">
import { storeToRefs } from 'pinia';

// import { usePaletteGeneratorStore } from '../model';
import { ImageCard, useImagesStore } from '@/entities/image';

const imagesStore = useImagesStore();
const { images } = storeToRefs(imagesStore);
</script>

<template>
  <section class="grid grid-cols-12 gap-5">
    <ImageCard
      v-for="[imageKey, image] in images"
      :key="imageKey"
      :image="image"
      class="col-span-4"
    />
  </section>
</template>
