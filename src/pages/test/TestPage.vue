<script setup lang="ts">
import { /* nextTick */ ref } from 'vue';
import { ImageCropper } from '@/features/image/crop-image';
import { generateColorsBetween, shadeHexColor } from '@/shared/lib/color';

const cropper = ref<InstanceType<typeof ImageCropper>>();
const colors = ref<string[]>([]);
// @ts-expect-error TEMP
function setColors(c: string[]) {
  colors.value = [...new Set(c)];
}

const SHADES_COUNT = 10;

function createBoxShadowLine(result: string, colors: string, index: number, array: string[]) {
  result += `0px 0px 0px ${index}px ${colors}`;

  if (index !== array.length - 1) result += ', ';

  return result;
}
// @ts-expect-error TEMP
function generateBoxShadow(centerColor: string): string {
  const DARKEST = shadeHexColor(centerColor, 1.05);
  const range = generateColorsBetween({
    startColor: centerColor,
    endColor: DARKEST,
    count: SHADES_COUNT,
  });

  return range.reduce(createBoxShadowLine, '');
}
// @ts-expect-error TEMP
function logColor(c: string) {
  console.log(c);
}

// const src = ref('https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png');
// const src = ref('https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Projection_main_aspect_ratio.svg/229px-Projection_main_aspect_ratio.svg.png');
// const src = ref('https://www.shutterstock.com/shutterstock/photos/716920510/display_1500/stock-photo-panoramic-beautiful-seascape-with-cloud-on-a-sunny-day-716920510.jpg');
const src = ref('https://i.imgur.com/reEImKg.jpg');
// const src = ref('');
</script>

<template>
  <section class="grid grid-cols-3 gap-5">
    <div class="w-full">
      <ImageCropper
        ref="cropper"
        :imageSource="src"
      />
      <!--      <div class="flex items-center justify-center flex-wrap gap-6 py-4 px-3">
        <div
          v-for="color in colors"
          :key="color"
          :style="{ backgroundColor: color, boxShadow: generateBoxShadow(color) }"
          class="w-5 h-5 rounded-full relative before-overlay"
          @click="logColor(color)"
        />
      </div> -->
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
