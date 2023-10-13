<script setup lang="ts">
import type { ButtonProps } from 'naive-ui';
import { NButton, NIcon, NPopconfirm } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { Plus, Trash2 } from 'lucide-vue-next';

import { generateColorData } from '@/entities/color';
import { generateColorsBetween, generateRandomRgb, getContrastTextColor, shadeHexColor } from '@/shared/lib/color';
import { useSortedColorsStore } from '@/features/color/sort-colors';

const sortedColorsStore = useSortedColorsStore();
const {
  generateColorObjects,
  addColorScheme,
  deleteColorSchemeByToken,
} = sortedColorsStore;
const {
  colorSchemes,
} = storeToRefs(sortedColorsStore);

onMounted(generateColorObjects);

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

function _addRandomColors(schemeToken: string) {
  const length = 1 + ((5 * crypto.getRandomValues(new Uint32Array(1))[0]) / 2 ** 32) | 0;

  const colors = Array
    .from({ length })
    .map(generateRandomRgb)
    .map(generateColorData);

  const target = colorSchemes.value.get(schemeToken);

  if (!target) return;

  colors.forEach((color) => {
    target.colors.push(color);
  });
}

function beforeLeave(el: Element) {
  /* TODO обнови зависимости под конец, пес */
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

function positiveButtonPropsHandler(schemeToken: string): ButtonProps {
  return {
    size: 'tiny',
    type: 'success',
    onClick: () => deleteColorSchemeByToken(schemeToken),
  };
}

const negativeButtonProps: ButtonProps = {
  size: 'tiny',
  type: 'error',
};
</script>

<template>
  <section
    v-if="isDev"
    class="pt-5"
  >
    <div class="flex flex-row font-mono w-full items-center pb-4">
      <div class="w-2/12 mr-1">
        11111
      </div>
      <div class="w-10/12 ml-1 px-6 gap-3 flex flex-nowrap">
        <NButton
          strong
          secondary
          circle
          type="success"
          @click="addColorScheme"
        >
          <template #icon>
            <NIcon>
              <Plus />
            </NIcon>
          </template>
        </NButton>
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
    <div class="flex flex-row font-mono text-xs overflow-hidden h-full max-h-[calc(100vh-120px)]">
      <div
        class="w-2/12 overflow-auto border rounded-xl border-cyan mr-1"
        dir="rtl"
      >
        <div dir="ltr">
          ???
        </div>
      </div>
      <div
        class="custom-scroll w-10/12 overflow-auto border rounded-xl border-cyan ml-1 pb-10 scroll-space"
        dir="ltr"
      >
        <div class="cards-container py-7 flex flex-col gap-y-7 relative px-3.5">
          <TransitionGroup
            name="cards-list"
            @beforeLeave="beforeLeave"
          >
            <div
              v-for="[schemeToken, scheme] in colorSchemes"
              :key="schemeToken"
              class="color-card p-2 before:pointer-events-none before:w-full before:aspect-square items-start auto-rows-fr before:col-start-[24] before:col-span-1 before:row-start-1 before:row-span-1 grid gap-2 place-items-start grid-cols-[repeat(24,_1fr)] w-full rounded-md hover:shadow-xl shadow-md transition-shadow bg-slate-50 relative group/card"
            >
              <button
                class="w-5 h-5 font-sans border border-red-500 rounded-md grid place-items-center absolute bottom-full left-full"
                @click="_addRandomColors(schemeToken)"
              >
                <Plus
                  :size="14"
                  class="text-red-500"
                />
              </button>

              <div
                class="w-full h-full col-start-[19] col-span-6 row-start-1 row-span-2 grid place-items-center bg-slate-100"
              >
                <div class="w-full h-full rounded-md border relative p-2">
                  <div class="w-full h-full rounded-md border relative p-2  grid place-items-center">
                    <div
                      class="relative z-10 text-2xl"
                      :style="{ color: getContrastTextColor(scheme.leadColor.hex) }"
                    >
                      {{ scheme.leadColor.hex }}
                    </div>

                    <div class="absolute right-2 top-2 z-10">
                      <NPopconfirm
                        class="!font-mono"
                        :showIcon="false"
                        :positiveButtonProps="positiveButtonPropsHandler(schemeToken)"
                        :negativeButtonProps="negativeButtonProps"
                        :showArrow="true"
                        placement="top"
                      >
                        <template #trigger>
                          <NButton
                            type="error"
                            size="tiny"
                          >
                            <template #icon>
                              <Trash2 :size="14" />
                            </template>
                          </NButton>
                        </template>
                        Remove group?
                      </NPopconfirm>
                    </div>

                    <div
                      class="w-full h-full absolute top-0 left-0 rounded-md z-0"
                      :style="{ backgroundColor: scheme.leadColor.hex }"
                    />
                  </div>
                </div>
              </div>

              <div
                v-for="color in scheme.colors"
                :key="color.hex"
                class="w-full aspect-square rounded inline-block "
                :style="{ backgroundColor: color.hex }"
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
  transition: all 0.35s ease-in-out;
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
