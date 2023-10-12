<script setup lang="ts">
import { watchDebounced } from '@vueuse/core';
import { onMounted, ref, toRefs } from 'vue';
import type { Coordinates } from '../model';
import { ratioClass, useImageCropper } from '../model';
import type { Img } from '@/entities/image';

interface Props {
  image: Img;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  onCrop: [croppedSrc: string];
  onResize: [];
  onDataChange: [
    data: {
      currentPointers: number;
      undoPointers: number;
      redoPointers: number;
      isDrawingMode: boolean;
      isEditing: boolean;
      isCropped: boolean;
      canvasIsHidden: boolean;
    },
  ];
}>();

const { image } = toRefs(props);

const parentElement = ref<HTMLElement | undefined>();
const imageElement = ref<HTMLImageElement | undefined>();
const canvasElement = ref<HTMLCanvasElement | undefined>();

function cropCallback(croppedSrc: string) {
  emit('onCrop', croppedSrc);
}

const cropperParams = {
  currentPointers: ref<Coordinates[]>([]),
  undoPointers: ref<Coordinates[]>([]),
  redoPointers: ref<Coordinates[]>([]),
  isDrawingMode: ref(false),
  isEditing: ref(true),
  isCropped: ref(!!image.value.croppedSrc),
  canvasIsHidden: ref(false),
  image,
  canvasElement,
  imageElement,
  parentElement,
  cropCallback,
};

const cropperData = useImageCropper(cropperParams);

const {
  init,
  mouseUp,
  mouseDown,
  mouseMove,
  reset,
  crop,
  toggleDrawing,
  undo,
  redo,
  isDrawingMode,
} = cropperData;

/* TODO Refactor */
watchDebounced([
  () => cropperParams.currentPointers.value.length,
  () => cropperParams.undoPointers.value.length,
  () => cropperParams.redoPointers.value.length,
  () => cropperParams.isDrawingMode.value,
  () => cropperParams.isEditing.value,
  () => cropperParams.isCropped.value,
  () => cropperParams.canvasIsHidden.value,
], ([currentPointers, undoPointers, redoPointers, isDrawingMode, isEditing, isCropped, canvasIsHidden]) => {
  emit('onDataChange', {
    currentPointers,
    undoPointers,
    redoPointers,
    isDrawingMode,
    isEditing,
    isCropped,
    canvasIsHidden,
  });
}, {
  debounce: 50,
  maxWait: 500,
});

onMounted(init);

defineExpose({
  init,
  mouseUp,
  mouseDown,
  mouseMove,
  reset,
  crop,
  undo,
  redo,
  toggleDrawing,
  isDrawingMode,
});

function transitionEndHandler(e: TransitionEvent) {
  if (e.propertyName === 'height' || e.propertyName === 'width') {
    reset();
    emit('onResize');
    cropperParams.canvasIsHidden.value = false;
  }
}

function transitionStartHandler(e: TransitionEvent) {
  if (e.propertyName === 'height' || e.propertyName === 'width') {
    cropperParams.canvasIsHidden.value = true;
  }
}
</script>

<template>
  <div class="w-full h-full group/card flex justify-center items-center">
    <div class="h-full aspect-[16/10] max-w-full max-h-full relative z-10 flex items-center justify-center">
      <div
        v-if="image"
        ref="parentElement"
        class="relative transition-all duration-300 overflow-hidden bg-white backdrop-blur-3xl bg-opacity-5 shadow-lg rounded-lg"
        :class="ratioClass"
        @transitionend="transitionEndHandler"
        @transitionstart="transitionStartHandler"
      >
        <img
          ref="imageElement"
          :src="image.blobSrc"
          class="absolute top-0 left-0 w-full h-full object-cover block"
          :class="[(cropperParams.isCropped.value || cropperParams.isEditing.value) && !cropperParams.canvasIsHidden.value ? 'opacity-5 delay-75' : 'pointer-events-auto delay-0']"
          alt="#"
          crossorigin="anonymous"
        >
        <canvas
          ref="canvasElement"
          class="absolute top-0 left-0 w-full h-full object-cover block"
          :class="[(cropperParams.isCropped.value || cropperParams.isEditing.value) && !cropperParams.canvasIsHidden.value ? 'pointer-events-auto opacity-100 delay-75' : 'pointer-events-none opacity-0 delay-0']"
          @mousedown="mouseDown"
          @mouseup="mouseUp"
          @mousemove="mouseMove"
        />
        <div
          v-if="!cropperParams.isDrawingMode.value && !cropperParams.canvasIsHidden.value"
          class="absolute w-full h-full pointer-events-none top-0 left-0"
        >
          <span
            v-for="point in cropperParams.currentPointers.value"
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
