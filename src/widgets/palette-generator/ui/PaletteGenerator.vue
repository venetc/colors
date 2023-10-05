<script setup lang="ts">
import { toRefs } from 'vue';
import type { Img } from '@/entities/image';
import { ImageCropper } from '@/features/image/crop-image';

const props = defineProps<{ image: Img }>();

const { image } = toRefs(props);
</script>

<template>
  <ImageCropper
    :image="image"
  />
</template>
