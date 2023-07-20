<script setup lang="ts">
import { /* nextTick */ ref } from 'vue';
import type { ExposedCropperData } from './CanvasCropper.vue';
import CanvasCropper from './CanvasCropper.vue';
import { generateColorsBetween, shadeHexColor } from '@/shared/lib/color';

const cropper = ref<InstanceType<typeof CanvasCropper> & ExposedCropperData>();
const colors = ref<string[]>([]);

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
  const range = generateColorsBetween({
    startColor: centerColor,
    endColor: DARKEST,
    count: SHADES_COUNT,
  });

  return range.reduce(createBoxShadowLine, '');
}

function logColor(c: string) {
  console.log(c);
}

// const src = ref('https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png');
const src = ref('https://i.imgur.com/reEImKg.jpg');
</script>

<template>
  <section class="w-[496px]">
    <div class="w-full">
      <CanvasCropper
        ref="cropper"
        :imageSource="src"
        @onColorsSend="setColors"
      >
        <template #actions="{ edit, isEdit, isDrawingMode, draw, redo, crop, undo, reset }: ExposedCropperData">
          <div class="flex flex-wrap gap-2 py-2">
            <button
              class="py-0.5 px-2 border-2 rounded-md disabled:cursor-not-allowed font-mono font-medium"
              :class="[isDrawingMode.value ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600']"
              :disabled="!isEdit.value"
              @click="draw()"
            >
              draw
            </button>
            <button
              class="py-0.5 px-2 border-2 rounded-md disabled:cursor-not-allowed font-mono font-medium"
              :class="[isEdit.value ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600']"
              @click="edit()"
            >
              edit
            </button>
            <button
              class="py-0.5 px-2 border-2 border-slate-950 rounded-md font-mono font-medium"
              @click="crop()"
            >
              crop
            </button>
            <button
              class="py-0.5 px-2 border-2 border-slate-950 rounded-md font-mono font-medium"
              @click="undo()"
            >
              undo
            </button>
            <button
              class="py-0.5 px-2 border-2 border-slate-950 rounded-md font-mono font-medium"
              @click="redo()"
            >
              redo
            </button>
            <button
              class="py-0.5 px-2 border-2 border-slate-950 rounded-md font-mono font-medium"
              @click="reset()"
            >
              reset
            </button>
          </div>
        </template>
      </CanvasCropper>
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
