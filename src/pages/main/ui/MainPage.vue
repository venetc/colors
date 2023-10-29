<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useImagesStore } from '@/entities/image';
import { useGetImageFromFile } from '@/features/image/get-from-image-file';
import { DataLoader } from '@/widgets/data-loader';
import { ImagesGrid } from '@/widgets/images-grid';

const imagesStore = useImagesStore();
const getImageFromFileModel = useGetImageFromFile();

const { images } = storeToRefs(imagesStore);
</script>

<template>
  <section class="root pb-5 grid grid-cols-12 gap-5">
    <ImagesGrid
      class="row-start-1 col-start-7 col-span-6 xl:col-start-7 xl:col-span-6 2xl:col-start-5 2xl:col-span-8"
      :images="images"
      @onRemove="imagesStore.removeImageFromList($event); getImageFromFileModel.removeFileFromList($event)"
    />

    <DataLoader
      class="loader-container bg-white/10 self-start p-3 rounded-md shadow-md row-start-1 col-span-8 col-start-3 lg:col-span-6 lg:col-start-4 xl:col-span-6 xl:col-start-4 2xl:col-span-4 2xl:col-start-5"
      :class="{
        '2xl:-translate-x-[calc(100%_+_1.25rem)] lg:-translate-x-[calc(50%_+_0.65rem)] -translate-x-1/2': images.size > 0,
      }"
    />
  </section>
</template>
