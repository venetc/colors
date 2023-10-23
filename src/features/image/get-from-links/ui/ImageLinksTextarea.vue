<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { NInput } from 'naive-ui';
import { useGetImageFromLinks } from '../model';
import { useImagesStore } from '@/entities/image';

const getImageFromLinksModel = useGetImageFromLinks();
const imagesStore = useImagesStore();

const { images } = storeToRefs(imagesStore);
const { textareaData } = storeToRefs(getImageFromLinksModel);
</script>

<template>
  <NInput
    v-model:value="textareaData"
    type="textarea"
    :resizable="false"
    placeholder="Paste images URL"
    :disabled="images.size > 0"
  />
</template>

<style scoped>
.n-input.n-input--textarea {
  min-height: 100%;
}
</style>
