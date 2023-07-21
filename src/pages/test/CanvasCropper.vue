<script setup lang="ts">
import { onMounted, readonly, ref, toRefs } from 'vue';
import { useElementBounding } from '@vueuse/core';
import { cover } from '@/shared/lib/canvas';
import { rgbToHex } from '@/shared/lib/color';
import { getPalette } from '@/entities/image/lib';

interface Props {
  imageSource: string;
}

export interface ExposedCropperData {
  reset: typeof reset;
  crop: typeof crop;
  undo: typeof undo;
  redo: typeof redo;
  edit: typeof edit;
  draw: typeof toggleDrawing;
  isEdit: Readonly<typeof isEditing>;
  isDrawingMode: Readonly<typeof isDrawingMode>;
}

const props = withDefaults(defineProps<Props>(), { imageSource: '' });

const emit = defineEmits<{
  onColorsSend: [colors: string[]];
}>();

const { imageSource } = toRefs(props);

const SCALE_FACTOR = 3;

interface Coordinates {
  x: number;
  y: number;
}

const isEditing = ref(false);
const isDrawingMode = ref(false);
const isCropped = ref(false);

const isDrawingInProgress = ref(false);

const canvasRef = ref<HTMLCanvasElement>();
const canvasParent = ref<HTMLElement>();
const imageRef = ref<HTMLImageElement>();

const imageObj = ref<HTMLImageElement | null>();
const position = ref<Coordinates | null>(null);
const positionOld = ref<Coordinates | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>();
const redoSnapshots = ref<string[]>([]);
const undoSnapshots = ref<string[]>([]);
const redoPointers = ref<Coordinates[]>([]);
const undoPointers = ref<Coordinates[]>([]);
const currentPointers = ref<Coordinates[]>([]);
const resultImage = ref<string | null>(null);

const imgWidth = ref(0);
const imgHeight = ref(0);

function init() {
  if (!canvasRef.value) return;

  ctx.value = canvasRef.value.getContext('2d', { willReadFrequently: true });
  if (ctx.value) ctx.value.imageSmoothingEnabled = false;

  const img = new Image();

  img.crossOrigin = 'anonymous';
  img.src = imageSource.value;

  img.onload = () => {
    if (!ctx.value) return;

    sendColors(img);

    const {
      width: parentWidth,
      height: parentHeight,
    } = useElementBounding(canvasParent);

    if (imageRef.value) {
      imageRef.value.width = Math.round(parentWidth.value);
      imageRef.value.height = Math.round(parentHeight.value);
    }

    imgWidth.value = Math.round(parentWidth.value) > 0 ? Math.round(parentWidth.value) : img.width;
    imgHeight.value = Math.round(parentHeight.value) > 0 ? Math.round(parentHeight.value) : img.height;
    ctx.value.canvas.width = Math.round(parentWidth.value) * SCALE_FACTOR;
    ctx.value.canvas.height = Math.round(parentHeight.value) * SCALE_FACTOR;

    const {
      offsetX,
      offsetY,
      width: _width,
      height: _height,
    } = cover(Math.round(parentWidth.value), Math.round(parentHeight.value), Math.round(img.naturalWidth) * SCALE_FACTOR, Math.round(img.naturalHeight) * SCALE_FACTOR);

    ctx.value.drawImage(img, ((offsetX) * SCALE_FACTOR), ((offsetY) * SCALE_FACTOR), ((_width) * SCALE_FACTOR), ((_height) * SCALE_FACTOR));

    const canvasImg = new Image();
    if (!canvasRef.value) return;

    canvasImg.crossOrigin = 'anonymous';
    canvasImg.src = canvasRef.value.toDataURL();
    canvasImg.onload = () => {
      imageObj.value = canvasImg;
    };
  };
}

function empty() {
  redoSnapshots.value = [];
  undoSnapshots.value = [];
  redoPointers.value = [];
  undoPointers.value = [];
  currentPointers.value = [];
}

function reset() {
  empty();
  imageObj.value = null;
  resultImage.value = null;
  isCropped.value = false;
  positionOld.value = position.value = null;
  init();
}

function savePointer(point: Coordinates) {
  redoPointers.value = [];
  currentPointers.value.push(point);
  undoPointers.value.push(point);
}

function restorePointer(pointersToPop: Coordinates[], pointersToPush: Coordinates[], isUndo: boolean) {
  if (pointersToPop.length === 0) return;

  const item = pointersToPop.pop();
  if (!item) return;

  pointersToPush.push(item);

  if (isUndo) {
    currentPointers.value.pop();

    if (pointersToPop.length > 0) {
      const {
        x,
        y,
      } = pointersToPop[pointersToPop.length - 1];

      positionOld.value = {
        x,
        y,
      };
    } else {
      positionOld.value = null;
    }
  } else {
    currentPointers.value.push(item);

    if (pointersToPush.length > 0) {
      const {
        x,
        y,
      } = pointersToPush[pointersToPush.length - 1];

      positionOld.value = {
        x,
        y,
      };
    }
  }
}

function saveState(canvas: HTMLCanvasElement, list = undoSnapshots.value, keepRedo = false) {
  if (!keepRedo) redoSnapshots.value = [];

  const data = canvas.toDataURL();
  list.push(data);
}

function restoreState(marksToPop: string[], marksToPush: string[]) {
  if (marksToPop.length) {
    if (!canvasRef.value) return;

    saveState(canvasRef.value, marksToPush, true);

    const restoredState = marksToPop.pop();
    if (!restoredState) return;

    const img = new Image();
    img.src = restoredState;
    img.onload = () => {
      if (!ctx.value) return;

      ctx.value.clearRect(0, 0, imgWidth.value * SCALE_FACTOR, imgHeight.value * SCALE_FACTOR);
      ctx.value.drawImage(img, 0, 0);
    };
  }
}

function undo() {
  if (!isEditing.value || isDrawingMode.value) return;

  isEditing.value = false;
  restoreState(undoSnapshots.value, redoSnapshots.value);
  restorePointer(undoPointers.value, redoPointers.value, true);
  isEditing.value = true;
}

function redo() {
  if (!isEditing.value || isDrawingMode.value) return;

  isEditing.value = false;
  restoreState(redoSnapshots.value, undoSnapshots.value);
  restorePointer(redoPointers.value, undoPointers.value, false);
  isEditing.value = true;
}

function trimEmptyPixel(canvasElement: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  interface Bound {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
  }

  const pixels = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);

  const amountOfPixels = pixels.data.length;

  const bound: Bound = {};
  let x, y, i;

  for (i = 0; i < amountOfPixels; i += 4) {
    const alpha = pixels.data[i + 3];
    const opaque = alpha !== 0;

    if (opaque) {
      x = (i / 4) % canvasElement.width;
      y = ~~((i / 4) / canvasElement.width);

      if (!bound.top) bound.top = y;
      if (!bound.left || x < bound.left) bound.left = x;
      if (!bound.right || bound.right < x) bound.right = x;
      if (!bound.bottom || bound.bottom < y) bound.bottom = y;
    }
  }

  if (!bound.bottom || !bound.top || !bound.right || !bound.left) return;

  const trimHeight = bound.bottom - bound.top;
  const trimWidth = bound.right - bound.left;
  const trimmed = ctx.getImageData(bound.left, bound.top, trimWidth, trimHeight);

  ctx.putImageData(trimmed, bound.left, bound.top);
}

function crop() {
  if (!isEditing.value || isCropped.value) return;
  if (!ctx.value || !canvasRef.value || !imageObj.value) return;
  if (currentPointers.value.length < 1) return;

  ctx.value.clearRect(0, 0, imgWidth.value * SCALE_FACTOR, imgHeight.value * SCALE_FACTOR);
  ctx.value.beginPath();
  ctx.value.globalCompositeOperation = 'destination-over';
  const left = canvasRef.value.offsetLeft;
  const top = canvasRef.value.offsetTop;

  for (let i = 0; i < currentPointers.value.length; i++) {
    const {
      x,
      y,
    } = currentPointers.value[i];

    i === 0
      ? ctx.value.moveTo(x * SCALE_FACTOR - left, y * SCALE_FACTOR - top)
      : ctx.value.lineTo(x * SCALE_FACTOR - left, y * SCALE_FACTOR - top);
  }

  const pattern = ctx.value.createPattern(imageObj.value, 'repeat');
  if (!pattern) return;

  ctx.value.fillStyle = pattern;
  ctx.value.fill();

  trimEmptyPixel(canvasRef.value, ctx.value);

  const img = new Image();
  img.src = canvasRef.value.toDataURL();
  img.onload = () => {
    sendColors(img);
  };

  empty();
  isCropped.value = true;
}

function sendColors(img: HTMLImageElement) {
  const palette = getPalette({
    img,
    colorCount: 5,
    quality: 2,
  });

  const colors = palette ? palette.map(rgbToHex) : [];

  emit('onColorsSend', colors);
}

function mouseDown(e: MouseEvent) {
  if (!isEditing.value) return;
  if (isCropped.value) return;
  if (!ctx.value || !canvasRef.value) return;

  if (isDrawingMode.value) {
    isDrawingInProgress.value = true;
  } else {
    saveState(canvasRef.value);

    if (positionOld.value && position.value && undoSnapshots.value.length > 0) {
      const {
        x: oldX,
        y: oldY,
      } = positionOld.value;

      const {
        x,
        y,
      } = position.value;

      ctx.value.beginPath();
      ctx.value.strokeStyle = '#ff0000';
      ctx.value.lineWidth = SCALE_FACTOR;
      ctx.value.lineCap = 'round';
      ctx.value.moveTo(oldX * SCALE_FACTOR, oldY * SCALE_FACTOR);
      ctx.value.lineTo(x * SCALE_FACTOR, y * SCALE_FACTOR);
      ctx.value.stroke();
    }

    savePointer({
      x: e.offsetX,
      y: e.offsetY,
    });

    positionOld.value = position.value = {
      x: e.offsetX,
      y: e.offsetY,
    };
  }
}

function mouseUp() {
  if (!isDrawingMode.value) return;
  isDrawingInProgress.value = false;
}

function mouseMove(e: MouseEvent) {
  if (!isEditing.value) return;

  position.value = {
    x: e.offsetX,
    y: e.offsetY,
  };

  if (!isDrawingInProgress.value) return;

  savePointer({
    x: position.value.x,
    y: position.value.y,
  });

  if (!ctx.value) return;

  const last = currentPointers.value[currentPointers.value.length - 1];
  const nextToLast = currentPointers.value[currentPointers.value.length - 2] ?? last;

  ctx.value.beginPath();
  ctx.value.lineWidth = 1.5 * SCALE_FACTOR;
  ctx.value.lineCap = 'round';
  ctx.value.strokeStyle = '#ff0000';
  ctx.value.moveTo(nextToLast.x * SCALE_FACTOR, nextToLast.y * SCALE_FACTOR);
  ctx.value.lineTo(last.x * SCALE_FACTOR, last.y * SCALE_FACTOR);
  ctx.value.stroke();
}

function edit() {
  if (!isCropped.value) reset();
  isEditing.value = !isEditing.value;
  if (!isEditing.value) isDrawingMode.value = false;
}

function toggleDrawing() {
  if (!isEditing.value) return;
  if (!isDrawingMode.value || !isCropped.value) reset();
  isDrawingMode.value = !isDrawingMode.value;
}

onMounted(init);

const exposedData: ExposedCropperData = {
  reset,
  crop,
  undo,
  redo,
  edit,
  draw: toggleDrawing,
  isDrawingMode: readonly(isDrawingMode),
  isEdit: readonly(isEditing),
};

function onTransitionStart(e: TransitionEvent) {
  if (e.propertyName === 'height' || e.propertyName === 'width') {
    console.log('???');
    reset();
  }
}
</script>

<template>
  <div class="w-full aspect-[16/10] flex items-center justify-center">
    <div
      ref="canvasParent"
      class="relative w-full h-full transition-all duration-300 rounded-xl overflow-hidden"
      :class="[isEditing ? 'bg-transparent' : 'bg-slate-50']"
      @transitionstart="onTransitionStart"
    >
      <img
        v-if="imageSource"
        ref="imageRef"
        :src="imageSource"
        class="absolute top-0 left-0 w-full h-full object-cover block"
        :class="[isCropped || isEditing ? 'opacity-25 pointer-events-none' : 'pointer-events-auto']"
        alt="#"
        crossorigin="anonymous"
        @load="console.log"
      >
      <canvas
        v-if="imageSource"
        ref="canvasRef"
        class="absolute top-0 left-0 w-full h-full object-cover block"
        :class="[isCropped || isEditing ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0']"
        @mousedown="mouseDown"
        @mouseup="mouseUp"
        @mousemove="mouseMove"
      />
      <div
        v-if="!isDrawingMode && imageSource"
        class="absolute w-full h-full pointer-events-none top-0 left-0"
      >
        <span
          v-for="point in currentPointers"
          :key="`${point.x},${point.y}`"
          class="vue-crop-pointer"
          :style="{ top: `${point.y}px`, left: `${point.x}px` }"
        />
      </div>
    </div>
  </div>

  <slot
    name="actions"
    v-bind="exposedData"
  />
</template>

<style>
.vue-crop-pointer {
  /*background-color: #00ff00;*/
  border-radius: 50%;
  border: 1px solid #ff0000;
  position: absolute;
  transform: translate(calc(-50%), -50%);
  width: 10px;
  height: 10px;
  pointer-events: none;
}
</style>
