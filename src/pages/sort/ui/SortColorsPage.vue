<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next';
import { NButton, NIcon } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import GroupCard from './ColorsGroupCard.vue';
import { generatePivotId, useSortedColorsStore } from '@/features/color/sort-colors';
import type { ColorHex } from '@/entities/color';
import { useColorsStore } from '@/entities/color';
import type { SchemeId } from '@/features/color/sort-colors';

import {
  generateColorsBetween,
  getBrightness,
  hexToRGB,
  hslToCss,
  rgbToCss,
  rgbToHSL,
  shadeHexColor,
} from '@/shared/lib/color';

const sortedColorsStore = useSortedColorsStore();

const { colorSchemes } = storeToRefs(sortedColorsStore);

const colorsStore = useColorsStore();
const { colors } = storeToRefs(colorsStore);

const isDev = import.meta.env.DEV;

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

function beforeLeave(el: Element) {
  /* TODO костыль, убрать */
  if (!(el instanceof HTMLElement)) return;
  const {
    marginLeft,
    marginTop,
    width,
    height,
  } = window.getComputedStyle(el);

  el.style.left = `${el.offsetLeft - Number.parseFloat(marginLeft)}px`;
  el.style.top = `${el.offsetTop - Number.parseFloat(marginTop)}px`;
  el.style.width = width;
  el.style.height = height;
}

const _newScheme = [{
  title: 'Add new group',
  handler: sortedColorsStore.addColorScheme,
}];

function leadColorChangeHandler(hex: ColorHex, id: SchemeId) {
  const targetScheme = colorSchemes.value.get(id);
  if (!targetScheme) return;

  const rgbArray = hexToRGB(hex);
  const rgb = rgbToCss(rgbArray);
  const hslArray = rgbToHSL(rgbArray);
  const hsl = hslToCss(hslArray);
  const brightness = getBrightness(rgbArray);

  targetScheme.leadColor = {
    hex,
    brightness,
    hsl,
    rgb,
    rgbArray,
    hslArray,
  };
}

onMounted(sortedColorsStore.invalidateSchemes);
</script>

<template>
  <section
    v-if="isDev"
    class="pt-5"
  >
    <div class="flex flex-row font-mono w-full items-center pb-4">
      <div class="w-2/12 mr-1">
        111
      </div>
      <div class="w-10/12 ml-1 px-6 gap-3 flex flex-nowrap">
        <NButton
          strong
          secondary
          circle
          type="error"
          @click="colorSchemes.clear()"
        >
          <template #icon>
            <NIcon>
              <Trash2 />
            </NIcon>
          </template>
        </NButton>
      </div>
    </div>
    <div class="flex flex-row justify-between font-mono text-xs overflow-hidden h-full max-h-[calc(100vh-120px)]">
      <div
        class="custom-scroll w-fit overflow-auto rounded-xl border-cyan pb-10 scroll-space"
        dir="rtl"
        @dragover="(e:Event) => e.preventDefault()"
        @drop="sortedColorsStore.dropHandler({ event: $event })"
      >
        <div
          dir="ltr"
          class="py-3.5 pl-7 pr-3.5 grid gap-3.5"
        >
          <div
            v-for="[imageId, colorCollection] in colors"
            :key="imageId"
            class="shadow-md rounded-md p-2 grid gap-1.5 place-items-start grid-cols-[repeat(2,_2.5rem)] w-fit"
          >
            <div
              v-for="(imageColor, index) in colorCollection"
              :key="`${imageColor.imageId}_${imageColor.original.hex}`"
              class="w-10 h-10 rounded border-2 border-black"
              draggable="true"
              :style="{ backgroundColor: imageColor.handpicked?.hex ?? imageColor.original.hex }"
              @dragstart="sortedColorsStore.dragStartHandler({ event: $event, pivotId: generatePivotId(imageId, index, imageColor) })"
            >
              {{ imageColor.isSorted ? 'S' : null }}
            </div>
          </div>
        </div>
      </div>
      <div
        class="custom-scroll overflow-auto rounded-xl border-cyan pb-10 scroll-space"
        dir="ltr"
      >
        <div class="cards-container py-3.5 pr-7 pl-3.5 flex flex-col items-center gap-3.5 relative">
          <TransitionGroup
            name="cards-list"
            @beforeLeave="beforeLeave"
          >
            <GroupCard
              v-for="[id, scheme] in colorSchemes"
              :id="id"
              :key="id"
              :scheme="scheme"
              @onColorDrop="(event, targetSchemaId) => sortedColorsStore.dropHandler({ event, targetSchemaId })"
              @onColorDragStart="(event, pivotId, originSchemaId) => sortedColorsStore.dragStartHandler({ originSchemaId, pivotId, event })"
              @onDelete="sortedColorsStore.deleteColorSchemeByToken"
              @onColorPick=" leadColorChangeHandler($event, id)"
            />

            <div
              v-for="cta in _newScheme"
              :key="cta.title"
              class="cursor-pointer p-2 auto-rows-[2.5rem] grid gap-1.5 justify-items-center items-center grid-cols-[repeat(26,_2.5rem)] border-2 border-dashed w-full transition-all rounded-md text-[rgba(32,_128,_240,_0.15)] hover:text-[rgba(32,_128,_240,_0.25)] active:text-[rgba(32,_128,_240,_0.5)] border-[rgba(32,_128,_240,_0.15)] hover:border-[rgba(32,_128,_240,_0.25)] active:border-[rgba(32,_128,_240,_0.5)]"
              @click="cta.handler"
            >
              <Plus
                class="col-[13_/span_1]"
                :size="26"
              />
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>
  </section>
  <section
    v-else
    class="flex items-center justify-center font-mono text-3xl"
  >
    <div>¯\_(ツ)_/¯</div>
  </section>
</template>

<style scoped>
.cards-list-move,
.cards-list-enter-active,
.cards-list-leave-active {
  transition: all 0.25s ease-in-out;
}

.cards-list-enter-from,
.cards-list-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.cards-list-leave-active {
  position: absolute;
}
</style>
