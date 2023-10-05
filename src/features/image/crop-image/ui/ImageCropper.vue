<script setup lang="ts">
import { Crop, Lasso, Redo2, RotateCcw, Scaling, Undo2 } from 'lucide-vue-next';
import { NButton, NPopselect, NSwitch } from 'naive-ui';
import { onMounted, ref, toRefs } from 'vue';

import type { CroppedImageData } from '../model';
import { useImageCropper } from '../model';
import type { Img } from '@/entities/image';

interface Props {
  image: Img;
}

const props = defineProps<Props>();

const { image } = toRefs(props);

const parentElement = ref<HTMLElement | undefined>();
const imageElement = ref<HTMLImageElement | undefined>();
const canvasElement = ref<HTMLCanvasElement | undefined>();

function cropCallback(data: CroppedImageData) {
  return console.log('crop', data);
}

const cropperParams = {
  image,
  canvasElement,
  imageElement,
  parentElement,
  cropCallback,
};

const cropper = useImageCropper(cropperParams);

const {
  init,
  mouseUp,
  mouseDown,
  mouseMove,
  undo,
  redo,
  crop,
  toggleDrawing,
  reset,
  ratioClass,
  ratios,
  selectedRatio,
  isDrawingMode,
  isEditing,
  isCropped,
  currentPointers,
  canvasIsHidden,
  redoPointers,
  undoPointers,
} = cropper;

onMounted(init);

function transitionEndHandler(e: TransitionEvent) {
  if (e.propertyName === 'height' || e.propertyName === 'width') {
    reset();
    canvasIsHidden.value = false;
  }
}

function transitionStartHandler(e: TransitionEvent) {
  if (e.propertyName === 'height' || e.propertyName === 'width') {
    canvasIsHidden.value = true;
  }
}
</script>

<template>
  <div class="w-full h-full group/card">
    <div class="h-full bg-white aspect-[16/10] relative z-10 flex items-center justify-center">
      <div
        v-if="image"
        ref="parentElement"
        class="relative transition-all duration-300 overflow-hidden"
        :class="[isEditing ? 'bg-transparent' : 'bg-slate-50', ratioClass]"
        @transitionend="transitionEndHandler"
        @transitionstart="transitionStartHandler"
      >
        <img
          ref="imageElement"
          :src="image.blobSrc"
          class="absolute top-0 left-0 w-full h-full object-cover block"
          :class="[(isCropped || isEditing) && !canvasIsHidden ? 'opacity-10 delay-75' : 'pointer-events-auto delay-0']"
          alt="#"
          crossorigin="anonymous"
          @load="console.log"
        >
        <canvas
          ref="canvasElement"
          class="absolute top-0 left-0 w-full h-full object-cover block"
          :class="[(isCropped || isEditing) && !canvasIsHidden ? 'pointer-events-auto opacity-100 delay-75' : 'pointer-events-none opacity-0 delay-0']"
          @mousedown="mouseDown"
          @mouseup="mouseUp"
          @mousemove="mouseMove"
        />
        <div
          v-if="!isDrawingMode && !canvasIsHidden"
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

    <div
      class="flex flex-wrap py-2 px-1 items-center justify-between transition-transform -translate-y-full group-hover/card:transform-none"
    >
      <div class="flex flex-wrap gap-2 items-center">
        <NSwitch
          size="medium"
          :round="false"
          :disabled="!isEditing"
          :value="isDrawingMode"
          @update:value="toggleDrawing"
        >
          <template #icon>
            <Lasso :size="16" />
          </template>
        </NSwitch>
        <NPopselect
          v-model:value="selectedRatio"
          :options="ratios"
          trigger="click"
          size="small"
          class="!font-mono"
        >
          <NButton
            size="tiny"
            type="info"
            class="!font-mono"
          >
            Ratio
            <template #icon>
              <Scaling :size="16" />
            </template>
          </NButton>
        </NPopselect>
      </div>

      <Transition
        name="fade"
      >
        <div
          v-if="!isDrawingMode"
          class="flex flex-wrap gap-2 items-center"
        >
          <NButton
            size="tiny"
            type="error"
            class="!font-mono"
            :disabled="undoPointers.length <= 0 || isCropped"
            @click="undo"
          >
            Undo
            <template #icon>
              <Undo2 :size="16" />
            </template>
          </NButton>
          <NButton
            size="tiny"
            type="error"
            class="!font-mono"
            :disabled="redoPointers.length <= 0 || isCropped"
            iconPlacement="right"
            @click="redo"
          >
            Redo
            <template #icon>
              <Redo2 :size="16" />
            </template>
          </NButton>
        </div>
      </Transition>

      <div class="flex flex-wrap gap-2 items-center">
        <NButton
          size="tiny"
          type="primary"
          class="!font-mono"
          :disabled="currentPointers.length <= 2 || isCropped"
          @click="crop"
        >
          Crop
          <template #icon>
            <Crop :size="16" />
          </template>
        </NButton>
        <NButton
          size="tiny"
          type="error"
          class="!font-mono"
          @click="reset"
        >
          Reset
          <template #icon>
            <RotateCcw :size="16" />
          </template>
        </NButton>
      </div>
    </div>
  </div>
</template>

<style>
.crop-pointer {
  background-color: #ff0000;
  border-radius: 50%;
  border: 1px solid #ff0000;
  position: absolute;
  transform: translate(calc(-50%), -50%);
  width: 5px;
  height: 5px;
  pointer-events: none;
}
</style>
