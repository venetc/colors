<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core';

import { NCard, NImage, NSkeleton } from 'naive-ui';
import { Check, ClipboardCopy, Maximize } from 'lucide-vue-next';
import { computed, nextTick, onMounted, ref, toRefs, watch } from 'vue';
import ExportColorCell from '@/pages/save/ui/ExportColorCell.vue';
import type { Color } from '@/entities/color';
import type { Img } from '@/entities/image';

interface Props {
  image: Img;
  colors: Color[];
  isCopied: boolean;
  isCopyingSupported: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  onCopy: [image: Img];
  onLoad: [image: Img];
}>();

const {
  image,
  colors,
  isCopyingSupported,
  isCopied,
} = toRefs(props);

const imagePreview = ref<HTMLElement>();
const imageRef = ref<HTMLImageElement>();

// const targetIsVisible = useElementVisibility(imagePreview);
const targetIsVisible = ref(false);

const { stop } = useIntersectionObserver(
  imagePreview,
  ([{ isIntersecting }]) => {
    targetIsVisible.value = isIntersecting;
  },
  { threshold: 0.25 },
);

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
  stop();
  unwatchInitialVisibility();
}, { immediate: true });

onMounted(() => {
  watch(targetSrc, () => nextTick(loadImage));
});

function copyHandler() {
  emit('onCopy', image.value);
}

function loadHandler() {
  emit('onLoad', image.value);
}
</script>

<template>
  <NCard
    ref="imagePreview"
    contentStyle="padding: 0;"
    hoverable
    class="!rounded-md !overflow-hidden w-full"
  >
    <template #cover>
      <div class="relative w-full h-72 aspect-[1.55/1] group/preview">
        <NSkeleton
          v-if="isLoading"
          class="absolute"
          height="100%"
        />
        <NImage
          v-else
          ref="imageRef"
          class="absolute w-full h-full chess-bg"
          :src="image.croppedSrc ?? image.blobSrc"
          objectFit="cover"
          :imgProps="{ crossorigin: 'anonymous', style: { width: '100%', height: '100%' } }"
          @load="loadHandler"
        />
        <div class="absolute bottom-1.5 right-1.5 flex flex-nowrap space-x-1.5 pointer-events-none">
          <div
            v-if="isCopyingSupported"
            class="border border-black/10 p-1 rounded shadow bg-black/25 text-white cursor-pointer pointer-events-auto  opacity-0 transition duration-300 group-hover/preview:opacity-100"
            @click="copyHandler"
          >
            <Transition
              name="fade"
              mode="out-in"
            >
              <Component
                :is="isCopied ? Check : ClipboardCopy"
                :size="16"
              />
            </Transition>
          </div>
          <div
            class="border border-black/10 p-1 rounded shadow bg-black/25 text-white cursor-pointer pointer-events-none  opacity-0 transition duration-300 group-hover/preview:opacity-100"
          >
            <Maximize :size="16" />
          </div>
        </div>
      </div>
    </template>
    <div
      v-if="colors.length > 0"
      class="flex"
    >
      <ExportColorCell
        v-for="color in colors"
        :key="color.hex"
        :color="color"
      />
    </div>
    <div
      v-else
      class="grid place-items-center h-10 chess-bg text-black"
    >
      <span>no colors 😢</span>
    </div>
  </NCard>
</template>
