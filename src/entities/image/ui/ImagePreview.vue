<script setup lang="ts">
import { computed, nextTick, onMounted, ref, toRefs, watch } from 'vue';
import { useElementVisibility } from '@vueuse/core';
import { NImage, NSkeleton } from 'naive-ui';

import type { ImageId, Img } from '../model';

const props = defineProps<{ image: Img }>();
const emit = defineEmits<{
  onLoad: [id: ImageId];
}>();

const { image } = toRefs(props);

const imagePreview = ref<HTMLElement>();
const imageRef = ref<HTMLImageElement>();

const targetIsVisible = useElementVisibility(imagePreview);

const _imageSrc = ref<HTMLImageElement['src'] | undefined>(undefined);

const isLoading = ref<boolean>(true);

const targetSrc = computed(() => (image.value.croppedSrc ?? image.value.blobSrc));

function loadImage() {
  isLoading.value = true;
  const img = new Image();
  img.crossOrigin = 'anonymous';

  img.onload = () => {
    _imageSrc.value = img.src;
    img.remove();
    isLoading.value = false;
  };

  img.src = targetSrc.value;
}

const unwatchInitialVisibility = watch(targetIsVisible, (isVisible) => {
  if (!isVisible) return;

  loadImage();
  unwatchInitialVisibility();
});

onMounted(() => {
  watch(targetSrc, () => nextTick(loadImage));
});

function loadHandler() {
  emit('onLoad', image.value.id);
}
</script>

<template>
  <div
    ref="imagePreview"
    class="relative"
  >
    <NSkeleton
      v-if="isLoading"
      class="absolute"
      height="100%"
    />
    <NImage
      v-else
      ref="imageRef"
      :src="_imageSrc"
      :alt="_imageSrc"
      :imgProps="{
        crossorigin: 'anonymous',
        decoding: 'async',
      }"
      height="320"
      class="absolute w-full h-full object-cover"
      objectFit="cover"
      @load="loadHandler"
    />
  </div>
</template>
