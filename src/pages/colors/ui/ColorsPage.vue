<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { useDataLoaderStore } from '@/widgets/data-loader';
import { PaletteGenerator, usePaletteGeneratorStore } from '@/widgets/palette-generator';

const dataLoaderStore = useDataLoaderStore();
const { linksArray } = storeToRefs(dataLoaderStore);

const paletteGeneratorStore = usePaletteGeneratorStore();
const { generateImagesData } = paletteGeneratorStore;

const generateData = () => generateImagesData(linksArray.value);

onMounted(generateData);
</script>

<template>
  <PaletteGenerator />
</template>
