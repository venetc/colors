<script setup lang="ts">
import { useThrottleFn } from '@vueuse/core';
import type { ButtonProps } from 'naive-ui';
import { NButton, NPopconfirm } from 'naive-ui';
import { computed, toRefs } from 'vue';
import { Download, Palette, RotateCcw, Trash2 } from 'lucide-vue-next';
import { beforeLeaveWorkaround } from '@/shared/lib/crutch';
import type { ColorHex } from '@/entities/color';
import type { ColorGroup, ColorGroupId, PivotId } from '@/features/color/sort-colors';
import { getContrastTextColor } from '@/shared/lib/color';

const props = defineProps<{
  colorGroupId: ColorGroupId;
  colorGroup: ColorGroup;
}>();
const emit = defineEmits<{
  onDelete: [id: ColorGroupId];
  onClear: [id: ColorGroupId];
  onLeadColorPick: [hex: ColorHex];
  onColorDrop: [event: DragEvent, id: ColorGroupId];
  onColorDragStart: [event: DragEvent, pivotId: PivotId, id: ColorGroupId];
}>();

const { colorGroupId, colorGroup } = toRefs(props);

function positiveButtonPropsHandler(mode: 'delete' | 'clear'): ButtonProps {
  return {
    size: 'tiny',
    type: 'success',
    onClick: () => mode === 'delete' ? emit('onDelete', colorGroupId.value) : emit('onClear', colorGroupId.value),
  };
}

const negativeButtonProps: ButtonProps = {
  size: 'tiny',
  type: 'error',
};

const leadColorChangeHandler = useThrottleFn((e: Event) => {
  if (!(e.target instanceof HTMLInputElement)) return;

  const hex = e.target.value as ColorHex;

  emit('onLeadColorPick', hex);
}, 50);

function dropHandler(event: DragEvent) {
  emit('onColorDrop', event, colorGroupId.value);
}

function dragStartHandler(event: DragEvent, pivotId: PivotId) {
  emit('onColorDragStart', event, pivotId, colorGroupId.value);
}

const sortedColors = computed(() => {
  return [...colorGroup.value.colors.entries()].sort((a, b) => {
    const [, imageColorA] = a;
    const [, imageColorB] = b;

    const colorA = imageColorA.handpicked ?? imageColorA.original;
    const colorB = imageColorB.handpicked ?? imageColorB.original;

    return colorB.luminance - colorA.luminance;
  });
});
</script>

<template>
  <div
    class="color-card p-3 items-stretch auto-rows-[2.5rem] 2xl:auto-rows-[2.5rem] xl:auto-rows-[2rem] lg:auto-rows-[1.5rem] grid gap-1.5 place-items-start w-fit rounded-md hover:shadow-xl shadow-md transition-shadow bg-slate-50 relative group/card 2xl:grid-cols-[repeat(26,_2.5rem)] xl:grid-cols-[repeat(26,_2rem)] lg:grid-cols-[repeat(26,_1.5rem)] grid-cols-[repeat(26,_2.5rem)]"
    @dragover="(e:Event) => e.preventDefault()"
    @drop="dropHandler"
  >
    <div
      class="group/cover w-full h-full col-start-[21] col-span-6 row-start-1 row-span-3 grid place-items-center"
    >
      <div class="w-full h-full rounded-xl border relative p-1.5 bg-slate-100">
        <div class="w-full h-full rounded-xl border relative p-2 grid place-items-center">
          <div
            class="relative z-10 text-xl select-none"
            :style="{ color: getContrastTextColor(colorGroup.leadColor.rgbArray) }"
          >
            {{ colorGroup.leadColor.hex }}
          </div>

          <div
            class="group-hover/cover:opacity-100 opacity-0 transition-all absolute border-black/10 border flex flex-nowrap right-1.5 bottom-1.5 z-10 bg-sky-100/50 px-1.5 py-1 gap-1 rounded"
          >
            <NPopconfirm
              class="!font-mono"
              :showIcon="false"
              :positiveButtonProps="positiveButtonPropsHandler('clear')"
              :negativeButtonProps="negativeButtonProps"
              :showArrow="true"
              placement="top"
            >
              <template #trigger>
                <NButton
                  type="error"
                  size="tiny"
                  :disabled="colorGroup.colors.size < 1"
                >
                  <template #icon>
                    <RotateCcw :size="14" />
                  </template>
                </NButton>
              </template>
              Remove colors?
            </NPopconfirm>
            <div class="overflow-hidden relative flex items-center content-center">
              <input
                :value="colorGroup.leadColor.hex"
                type="color"
                class="opacity-0 absolute w-full h-full cursor-pointer bottom-0 left-0 z-10"
                @change="leadColorChangeHandler"
                @input="leadColorChangeHandler"
              >
              <NButton
                type="info"
                size="tiny"
                class="relative z-0"
              >
                <template #icon>
                  <Palette :size="16" />
                </template>
              </NButton>
            </div>
            <NPopconfirm
              class="!font-mono"
              :showIcon="false"
              :positiveButtonProps="positiveButtonPropsHandler('delete')"
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
            class="w-full h-full absolute top-0 left-0 rounded-md transition-all ease-linear duration-100 z-0"
            :style="{ backgroundColor: colorGroup.leadColor.hex }"
          />
        </div>
      </div>
    </div>

    <div
      v-if="!colorGroup.colors.size"
      class="flex flex-col items-center justify-center gap-1 text-xl text-slate-400 transition-all col-[1_/_span_20] row-span-3 w-full border-2 border-dashed rounded-md border-slate-300 opacity-0 hover:opacity-100"
    >
      <div class="select-none">
        Drag and drop colors here
      </div>
      <Download :size="26" />
    </div>

    <TransitionGroup
      v-else
      name="colors-list"
      appear
      @beforeLeave="beforeLeaveWorkaround"
    >
      <div
        v-for="[pivotId, color] in sortedColors"
        :key="pivotId"
        class="w-10 h-10 2xl:w-10 2xl:h-10 xl:w-8 xl:h-8 lg:w-6 lg:h-6 rounded border-2 2xl:border-2 xl:border-2 lg:border border-black self-center"
        :style="{ backgroundColor: color.handpicked?.hex ?? color.original.hex }"
        draggable="true"
        @dragstart="dragStartHandler($event, pivotId)"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.colors-list-move,
.colors-list-enter-active,
.colors-list-leave-active {
  transition: all 0.3s ease;
}

.colors-list-enter-from,
.colors-list-leave-to {
  opacity: 0;
  transform: rotateY(90deg);
}

.colors-list-leave-active {
  position: absolute;
}
</style>
