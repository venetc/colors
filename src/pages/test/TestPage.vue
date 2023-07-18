<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { NInput } from 'naive-ui';
import CanvasCropper from './CanvasCropper.vue';
import { generateColorsBetween, shadeHexColor } from '@/shared/lib/color';

interface CropperMethods {
  reset: () => void
  crop: () => void
  undo: () => void
  redo: () => void
  edit: () => void
  isEdit: Readonly<boolean>
}

const cropper = ref<InstanceType<typeof CanvasCropper> & CropperMethods>();

const colors = ref<string[]>([]);

function reset() {
  if (cropper.value)
    cropper.value.reset();
}
function crop() {
  if (cropper.value)
    cropper.value.crop();
}
function undo() {
  if (cropper.value)
    cropper.value.undo();
}
function redo() {
  if (cropper.value)
    cropper.value.redo();
}
function edit() {
  if (!cropper.value)
    return;

  cropper.value.edit();
  isEdit.value = cropper.value.isEdit;
}

const isEdit = ref(false);

function setColors(c: string[]) {
  colors.value = [...new Set(c)];
}

const SHADES_COUNT = 10;

function createBoxShadowLine(result: string, colors: string, index: number, array: string[]) {
  result += `0px 0px 0px ${index}px ${colors}`;

  if (index !== array.length - 1)
    result += ', ';

  return result;
}

function generateBoxShadow(centerColor: string): string {
  const DARKEST = shadeHexColor(centerColor, 1.05);
  const range = generateColorsBetween({ startColor: centerColor, endColor: DARKEST, count: SHADES_COUNT });

  return range.reduce(createBoxShadowLine, '');
}

function logColor(c: string) {
  console.log(c);
}

// const src = ref('https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png');
const src = ref('https://i.imgur.com/reEImKg.jpg');

function setImage(value: string) {
  src.value = value;
  nextTick(reset);
}

async function xxx(e: Event) {
  console.log(e);
  const files = (e.target as HTMLInputElement).files;
  const img = new Image();

  if (files) {
    if (!files)
      return;

    img.src = URL.createObjectURL(files[0]);
  }
  else {
    const url = (e.target as HTMLInputElement).value;

    const response = await fetch(url);
    const blob = await response.blob();

    img.src = URL.createObjectURL(blob);
  }
  console.log(img);
}
</script>

<template>
  <section class="w-[496px]">
    <input
      type="file"
      @change="xxx"
    >
    <input
      type="url"
      @change="xxx"
    >
    <NInput
      class="my-4"
      :on-input="setImage"
    />
    <div class="flex flex-wrap gap-2 py-2">
      <button
        class="py-0.5 px-2 border border-slate-950 rounded-md outline-offset-1 outline outline-2"
        :class="[isEdit ? 'outline-green-600' : 'outline-red-600']"
        @click="edit"
      >
        edit
      </button>
      <button
        class="py-0.5 px-2 border border-slate-950 rounded-md"
        @click="crop"
      >
        crop
      </button>
      <button
        class="py-0.5 px-2 border border-slate-950 rounded-md"
        @click="undo"
      >
        undo
      </button>
      <button
        class="py-0.5 px-2 border border-slate-950 rounded-md"
        @click="redo"
      >
        redo
      </button>
      <button
        class="py-0.5 px-2 border border-slate-950 rounded-md"
        @click="reset"
      >
        reset
      </button>
    </div>
    <div class="w-full h-80">
      <CanvasCropper
        ref="cropper"
        :image-source="src"
        @on-colors-send="setColors"
      />
    </div>
    <div class="flex items-center justify-center flex-wrap gap-6 py-4 px-3">
      <div
        v-for="color in colors"
        :key="color"
        :style="{ backgroundColor: color, boxShadow: generateBoxShadow(color) }"
        class="w-6 h-6 rounded-full relative before-overlay"
        @click="logColor(color)"
      />
    </div>
  </section>
</template>

<style>
.before-overlay:before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% + v-bind(SHADES_COUNT) * 2px);
  height: calc(100% + v-bind(SHADES_COUNT) * 2px);
  border-radius: 50%;
}
</style>
