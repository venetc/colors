<script setup lang="ts">
import { onMounted, readonly, ref, toRefs } from 'vue';
import { useElementBounding, useParentElement } from '@vueuse/core';
import { cover } from '@/shared/lib/canvas';
import { rgbToHex } from '@/shared/lib/color';
import { getPalette } from '@/entities/image/lib';

interface Props {
  imageSource: string
}

const props = withDefaults(defineProps<Props>(), { imageSource: '' });

const emit = defineEmits<{
  onColorsSend: [colors: string[]]
}>();

const { imageSource } = toRefs(props);

interface Pointer {
  x: string
  y: string
  positionX: number
  positionY: number
}

const isEditing = ref(false);
const isCropped = ref(false);

const canvasRef = ref<HTMLCanvasElement>();

const imageObj = ref<HTMLImageElement | null>();
const positionX = ref('');
const positionY = ref('');
const oldPositionX = ref('');
const oldPositionY = ref('');
const ctx = ref<CanvasRenderingContext2D | null>();
const redoMarks = ref<number[]>([]);
const undoMarks = ref<number[]>([]);
const currentMarks = ref<number[]>([]);
const redoList = ref<string[]>([]);
const undoList = ref<string[]>([]);
const redoPointer = ref<Pointer[]>([]);
const undoPointer = ref<Pointer[]>([]);
const currentPointer = ref<Pointer[]>([]);
const resultImage = ref<string | null>(null);
const imgWidth = ref(0);
const imgHeight = ref(0);

const parentEl = useParentElement();

function init() {
  if (!canvasRef.value)
    return;

  ctx.value = canvasRef.value.getContext('2d', { willReadFrequently: true });

  const img = new Image();

  img.crossOrigin = 'Anonymous';
  img.src = imageSource.value;

  img.onload = () => {
    if (!ctx.value)
      return;

    sendColors(img);

    const { width: parentWidth, height: parentHeight } = useElementBounding(parentEl.value);

    imgWidth.value = parentWidth.value > 0 ? parentWidth.value : img.width;
    imgHeight.value = parentHeight.value > 0 ? parentHeight.value : img.height;
    ctx.value.canvas.width = parentWidth.value;
    ctx.value.canvas.height = parentHeight.value;

    const {
      offsetX,
      offsetY,
      width: _width,
      height: _height,
    } = cover(parentWidth.value, parentHeight.value, img.naturalWidth, img.naturalHeight);

    ctx.value.drawImage(img, offsetX, offsetY, _width, _height);

    const canvasImg = new Image();
    if (!canvasRef.value)
      return;

    canvasImg.crossOrigin = 'Anonymous';
    canvasImg.src = canvasRef.value.toDataURL();
    canvasImg.onload = () => {
      imageObj.value = canvasImg;
    };
  };
}

function empty() {
  redoList.value = [];
  undoList.value = [];
  redoPointer.value = [];
  undoPointer.value = [];
  currentPointer.value = [];
  redoMarks.value = [];
  undoMarks.value = [];
  currentMarks.value = [];
}

function reset() {
  empty();
  imageObj.value = null;
  resultImage.value = null;
  isCropped.value = false;
  oldPositionX.value = oldPositionY.value = positionX.value = positionY.value = '';
  init();
}

function savePointer(point: Pointer) {
  redoPointer.value = [];
  currentPointer.value.push(point);
  undoPointer.value.push(point);
}

function restorePointer(pointersToPop: Pointer[], pointersToPush: Pointer[], isUndo: boolean) {
  if (pointersToPop.length > 0) {
    const item = pointersToPop.pop();
    if (item) {
      pointersToPush.push(item);

      if (isUndo) {
        oldPositionX.value = item.positionX.toString();
        oldPositionY.value = item.positionY.toString();
        currentPointer.value.pop();
      }
      else {
        if (redoPointer.value.length > 0) {
          oldPositionX.value = redoPointer.value[redoPointer.value.length - 1].positionX.toString();
          oldPositionY.value = redoPointer.value[redoPointer.value.length - 1].positionY.toString();
        }
        currentPointer.value.push(item);
      }
    }
  }
}

function restoreMarks(marksToPop: number[], marksToPush: number[], isUndo: boolean) {
  if (marksToPop.length > 1) {
    const item = marksToPop.splice(marksToPop.length - 2, 2);

    marksToPush.push(...item);

    if (isUndo)
      currentMarks.value.splice(marksToPop.length, 2);
    else
      currentMarks.value.push(...item);
  }
}

function saveState(canvas: HTMLCanvasElement, list?: string[], keepRedo?: boolean) {
  keepRedo = keepRedo || false;
  if (!keepRedo)
    redoList.value = [];

  const data = canvas.toDataURL();
  const target = list || undoList.value;

  target.push(data);
}

function restoreState(marksToPop: string[], marksToPush: string[]) {
  if (marksToPop.length) {
    if (!canvasRef.value)
      return;

    saveState(canvasRef.value, marksToPush, true);
    const restoreState = marksToPop.pop();
    if (!restoreState)
      return;

    const img = new Image();
    img.src = restoreState;
    img.onload = () => {
      if (!ctx.value)
        return;
      ctx.value.clearRect(0, 0, imgWidth.value, imgHeight.value);

      ctx.value.drawImage(img, 0, 0);
    };
  }
}

function undo() {
  if (isEditing.value) {
    isEditing.value = false;
    restoreState(undoList.value, redoList.value);
    restorePointer(undoPointer.value, redoPointer.value, true);
    restoreMarks(undoMarks.value, redoMarks.value, true);
    isEditing.value = true;
  }
}

function redo() {
  if (isEditing.value) {
    isEditing.value = false;
    restoreState(redoList.value, undoList.value);
    restorePointer(redoPointer.value, undoPointer.value, false);
    restoreMarks(redoMarks.value, undoMarks.value, false);
    isEditing.value = true;
  }
}

function trimEmptyPixel(canvasElement: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  interface Bound {
    top?: number
    left?: number
    right?: number
    bottom?: number
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

      if (!bound.top)
        bound.top = y;
      if (!bound.left || x < bound.left)
        bound.left = x;
      if (!bound.right || bound.right < x)
        bound.right = x;
      if (!bound.bottom || bound.bottom < y)
        bound.bottom = y;
    }
  }

  if (!bound.bottom || !bound.top || !bound.right || !bound.left)
    return;

  const trimHeight = bound.bottom - bound.top;
  const trimWidth = bound.right - bound.left;
  const trimmed = ctx.getImageData(bound.left, bound.top, trimWidth, trimHeight);

  ctx.putImageData(
    trimmed,
    bound.left,
    bound.top,
  );
}

function crop() {
  if (!isEditing.value || isCropped.value)
    return;
  if (!ctx.value || !canvasRef.value || !imageObj.value)
    return;
  if (!currentMarks.value.length)
    return;

  currentPointer.value = [];
  ctx.value.clearRect(0, 0, imgWidth.value, imgHeight.value);
  ctx.value.beginPath();
  ctx.value.globalCompositeOperation = 'destination-over';
  const left = canvasRef.value.offsetLeft;
  const top = canvasRef.value.offsetTop;

  for (let i = 0; i < currentMarks.value.length; i += 2) {
    const x = currentMarks.value[i];
    const y = currentMarks.value[i + 1];
    if (i === 0)
      ctx.value.moveTo(x - left, y - top);
    else
      ctx.value.lineTo(x - left, y - top);
  }
  const pattern = ctx.value.createPattern(imageObj.value, 'repeat');
  if (!pattern)
    return;
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
  const palette = getPalette({ img, colorCount: 10, quality: 2 });

  const colors = palette ? palette.map(rgbToHex) : [];

  emit('onColorsSend', colors);
}

function mouseDown(e: MouseEvent) {
  if (!isEditing.value)
    return;
  if (isCropped.value)
    return;

  if (e.button === 0) {
    if (!ctx.value || !canvasRef.value)
      return;
    saveState(canvasRef.value);
    if (oldPositionX.value !== '' && undoList.value.length > 0) {
      ctx.value.beginPath();
      ctx.value.moveTo(Number(oldPositionX.value), Number(oldPositionY.value));
      ctx.value.lineTo(Number(positionX.value), Number(positionY.value));
      ctx.value.strokeStyle = '#F63E02';
      ctx.value.lineWidth = 1;
      ctx.value.stroke();
    }

    redoMarks.value = [];
    currentMarks.value.push(e.offsetX, e.offsetY);
    undoMarks.value.push(e.offsetX, e.offsetY);

    savePointer({
      x: `${e.offsetX}px`,
      y: `${e.offsetY}px`,
      positionX: e.offsetX,
      positionY: e.offsetY,
    });

    oldPositionX.value = e.offsetX.toString();
    oldPositionY.value = e.offsetY.toString();
  }

  positionX.value = e.offsetX.toString();
  positionY.value = e.offsetY.toString();
}

function mouseMove(e: MouseEvent) {
  if (!isEditing.value)
    return;

  positionX.value = e.offsetX.toString();
  positionY.value = e.offsetY.toString();
}

function edit() {
  if (!isCropped.value)
    reset();
  isEditing.value = !isEditing.value;
}

onMounted(init);

defineExpose({ reset, crop, undo, redo, edit, isEdit: readonly(isEditing) });
</script>

<template>
  <div class="relative w-full h-full">
    <img
      :style="{
        opacity: isCropped || isEditing ? 0.25 : 1,
        pointerEvents: isCropped || isEditing ? 'none' : 'auto',
      }"
      :src="imageSource"
      class="absolute w-full h-full object-cover block"
      alt="#"
      crossorigin="anonymous"
    >
    <canvas
      ref="canvasRef"
      :style="{ pointerEvents: isCropped || isEditing ? 'auto' : 'none' }"
      class="absolute w-full h-full object-cover block"
      @mousedown="mouseDown"
      @mousemove="mouseMove"
    />
    <span
      v-for="point in currentPointer"
      :key="`${point.x},${point.y}`"
      class="vue-crop-pointer "
      :style="{ top: point.y, left: point.x }"
    />
  </div>
</template>

<style>
.vue-crop-pointer {
  background-color: red;
  border-radius: 50%;
  position: absolute;
  transform: translate(-50%, -50%);
  width: 5px;
  height: 5px;
  pointer-events: none;
}
</style>
