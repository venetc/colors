<script setup lang="ts">
import { useImageCropper } from '../model';

import { useDebounceFn } from '@vueuse/core';
import { computed, inject, onMounted, ref, toRefs } from 'vue';

import type { ExposedCropperData } from '../model';
import type { Coordinates } from '@/features/crop-image';
import type { Img } from '@/entities/image';

import { cropperInfrastructureData } from '@/features/crop-image';

interface Props {
  image: Img;
  size: { width: number; height: number };
}

const props = defineProps<Props>();
const emit = defineEmits<{
  onCrop: [croppedSrc: string];
  onResize: [];
}>();

const {
  image,
  size,
} = toRefs(props);

const parentElement = ref<HTMLElement | undefined>();
const imageElement = ref<HTMLImageElement | undefined>();
const canvasElement = ref<HTMLCanvasElement | undefined>();
const currentPointers = ref<Coordinates[]>([]);

const {
  init,
  mouseUp,
  mouseDown,
  mouseMove,
  reset,
  crop,
  undo,
  redo,
  toggleDrawing,
} = useImageCropper({
  currentPointers,
  image,
  canvasElement,
  imageElement,
  parentElement,
  cropCallback,
});

const exposedCropperData: ExposedCropperData = {
  init,
  mouseUp,
  mouseDown,
  mouseMove,
  reset,
  crop,
  undo,
  redo,
  toggleDrawing,
};

defineExpose(exposedCropperData);

const cropperInfraData = inject(cropperInfrastructureData);

const debouncedReset = useDebounceFn(reset, 100);

function transitionEndHandler(e: TransitionEvent) {
  if (e.propertyName === 'height' || e.propertyName === 'width') {
    debouncedReset();
    emit('onResize');
    cropperInfraData?.setIsCanvasHiddenFlag(false);
  }
}

function transitionStartHandler(e: TransitionEvent) {
  if (e.propertyName === 'height' || e.propertyName === 'width') {
    cropperInfraData?.setIsCanvasHiddenFlag(true);
  }
}

function cropCallback(croppedSrc: string) {
  emit('onCrop', croppedSrc);
}

onMounted(init);

const shouldShowCanvas = computed(() => {
  const isCropped = cropperInfraData?.isImageCroppedFlag.value;
  const isEditing = cropperInfraData?.isEditingModeFlag.value;
  const canvasIsHidden = cropperInfraData?.isCanvasHiddenFlag.value;

  return (isCropped || isEditing) && !canvasIsHidden;
});

const shouldShowPointers = computed(() => {
  const isDrawingMode = cropperInfraData?.isDrawingModeFlag.value;
  const canvasIsHidden = cropperInfraData?.isCanvasHiddenFlag.value;

  return !isDrawingMode && !canvasIsHidden;
});
</script>

<template>
  <div class="w-full h-full group/card flex justify-center items-center">
    <div class="h-full aspect-[16/10] max-w-full max-h-full relative z-10 flex items-center justify-center">
      <div
        v-if="image"
        ref="parentElement"
        class="relative transition-all ease-linear duration-75 overflow-hidden bg-white backdrop-blur-3xl bg-opacity-5 shadow-lg rounded-lg will-change-[width,height]"
        :style="{ width: `${size.width}%`, height: `${size.height}%` }"
        @transitionend="transitionEndHandler"
        @transitionstart="transitionStartHandler"
      >
        <img
          ref="imageElement"
          :src="image.blobSrc"
          class="absolute top-0 left-0 w-full h-full object-cover block select-none"
          :class="[shouldShowCanvas ? 'opacity-5 delay-500' : 'pointer-events-auto delay-0']"
          alt="#"
          crossorigin="anonymous"
        >
        <canvas
          ref="canvasElement"
          class="absolute top-0 left-0 w-full h-full object-cover block"
          :class="[shouldShowCanvas ? 'pointer-events-auto opacity-100 delay-500' : 'pointer-events-none opacity-0 delay-0']"
          @pointerdown="mouseDown"
          @pointerup="mouseUp"
          @pointermove="mouseMove"
        />
        <div
          v-if="shouldShowPointers"
          class="absolute w-full h-full pointer-events-none top-0 left-0"
        >
          <span
            v-for="point in currentPointers"
            :key="`${point.x},${point.y}`"
            class="crop-pointer"
            :style="{ top: `${point.y}px`, left: `${point.x}px` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.crop-pointer {
  border-radius: 50%;
  border: 1px solid yellow;
  position: absolute;
  transform: translate(calc(-50%), -50%);
  width: 8px;
  height: 8px;
  pointer-events: none;
  background-color: black;
}

.crop-pointer:before, .crop-pointer:after {
  display: block;
  position: absolute;
  background-color: yellow;
  content: ' ';
  top: 50%;
  left: 50%;
  transform: translateY(-50%) translateX(-50%);
  z-index: 0;
}

.crop-pointer:before {
  width: 1px;
  height: 300%;
}

.crop-pointer:after {
  width: 300%;
  height: 1px;
}
</style>
