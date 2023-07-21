<script setup lang="ts">
import { NCard } from 'naive-ui';
import { ref, toRefs, watch } from 'vue';
import { useElementVisibility, useImage } from '@vueuse/core';
import { getPalette } from '../lib';
import { type Img } from '../model';
import { rgbToHex } from '@/shared/lib/color';

const props = defineProps<{ image: Img }>();

const { image } = toRefs(props);

const card = ref<HTMLElement>();
const imageRef = ref<HTMLImageElement>();

const targetIsVisible = useElementVisibility(card);

const _imageSrc = ref<HTMLImageElement['src'] | undefined>(undefined);

const isLoading = ref<boolean>(true);

const unwatchVisibility = watch(targetIsVisible, (isVisible) => {
  if (!isVisible)
    return;
  _imageSrc.value = image.value.src;
  unwatchVisibility();
});

const unwatchImageSrc = watch(_imageSrc, async (src) => {
  if (!src) return;

  const loadImage = useImage({ crossorigin: 'anonymous', src });

  loadImage.then((image) => {
    isLoading.value = image.isLoading.value;
    unwatchImageSrc();
  });
});

const imagePalette = ref<string[]>();

function onLoad() {
  if (!imageRef.value) return;

  const palette = getPalette({ img: imageRef.value, colorCount: 5, quality: 2 });

  imagePalette.value = palette.map(rgbToHex);
}
</script>

<template>
  <NCard
    ref="card"
    hoverable
  >
    <template #cover>
      <div class="relative w-full h-80">
        <div
          v-if="isLoading"
          class="absolute w-full h-full flex items-center justify-center"
        >
          <span>LOADING...</span>
        </div>
        <img
          v-else
          ref="imageRef"
          :src="_imageSrc"
          :alt="_imageSrc"
          crossorigin="anonymous"
          height="320"
          class="absolute w-full h-full object-cover"
          @load="onLoad"
        >
      </div>
      <div class="flex flex-wrap gap-3 py-3 px-2">
        <div
          v-for="color in imagePalette"
          :key="color"
          :style="{ backgroundColor: color }"
          class="w-8 h-8 rounded-full"
        />
      </div>
    </template>
  </NCard>
</template>
