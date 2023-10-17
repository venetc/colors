<script setup lang="ts">
import { computed, nextTick, ref, toRefs, watch } from 'vue';
import { useElementVisibility } from '@vueuse/core';
import { NSkeleton } from 'naive-ui';
import { type Img } from '../model';

const props = defineProps<{ image: Img }>();
const emit = defineEmits<{
  onLoad: [src: string];
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

    isLoading.value = false;
    emit('onLoad', targetSrc.value);
    /* ??? */
    img.removeAttribute('src');
    /* ??? */
  };

  img.src = targetSrc.value;
}

const unwatchInitialVisibility = watch(targetIsVisible, (isVisible) => {
  if (!isVisible) return;

  loadImage();
  unwatchInitialVisibility();
});

watch(targetSrc, () => nextTick(loadImage));
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

    <img
      v-else
      ref="imageRef"
      :src="_imageSrc"
      :alt="_imageSrc"
      crossorigin="anonymous"
      height="320"
      class="absolute w-full h-full object-cover"
    >
  </div>
</template>
