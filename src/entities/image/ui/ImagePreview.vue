<script setup lang="ts">
import { computed, ref, toRefs, unref, watch } from 'vue';
import { useElementVisibility } from '@vueuse/core';
import { NSkeleton } from 'naive-ui';

// import { getPalette } from '../lib';
import { type Img } from '../model';

// import { rgbToHex } from '@/shared/lib/color';

const props = defineProps<{ image: Img }>();
const emit = defineEmits<{
  onLoad: [image: Img];
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
    emit('onLoad', unref(image));
  };

  img.src = targetSrc.value;
}

const unwatchInitialVisibility = watch(targetIsVisible, (isVisible) => {
  if (!isVisible) return;

  loadImage();
  unwatchInitialVisibility();
});

watch(targetSrc, loadImage);

// const imagePalette = ref<string[]>();

/* function onLoad() {
  if (!imageRef.value) return;

  const palette = getPalette({
    img: imageRef.value,
    colorCount: 5,
    quality: 2,
  });

  imagePalette.value = palette.map(rgbToHex);
} */
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

  <!--    <div class="flex flex-wrap gap-3 py-3 px-2">
    <div
      v-for="color in imagePalette"
      :key="color"
      :style="{ backgroundColor: color }"
      class="w-8 h-8 rounded-full"
    />
  </div> -->
</template>
