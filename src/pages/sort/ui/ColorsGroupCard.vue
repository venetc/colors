<script setup lang="ts">
import { useThrottleFn } from '@vueuse/core';
import type { ButtonProps } from 'naive-ui';
import { NButton, NPopconfirm } from 'naive-ui';
import { toRefs } from 'vue';
import { Download, Palette, RotateCcw, Trash2 } from 'lucide-vue-next';
import type { ColorHex } from '@/entities/color';
import { useSortedColorsStore } from '@/features/color/sort-colors';
import type { ColorScheme, PivotId, SchemeId } from '@/features/color/sort-colors';
import { getContrastTextColor } from '@/shared/lib/color';

const props = defineProps<{
  id: SchemeId;
  scheme: ColorScheme;
}>();
const emit = defineEmits<{
  onDelete: [id: SchemeId];
  onLeadColorPick: [hex: ColorHex];
  onColorDrop: [event: DragEvent, id: SchemeId];
  onColorDragStart: [event: DragEvent, pivotId: PivotId, id: SchemeId];
}>();

const {
  id,
  scheme,
} = toRefs(props);

const sortedColorsStore = useSortedColorsStore();

function positiveButtonPropsHandler(schemeToken: SchemeId): ButtonProps {
  return {
    size: 'tiny',
    type: 'success',
    onClick: () => emit('onDelete', schemeToken),
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

function dropHandler(event: DragEvent) {
  emit('onColorDrop', event, id.value);
}

function dragStartHandler(event: DragEvent, pivotId: PivotId) {
  emit('onColorDragStart', event, pivotId, id.value);
}

// sortedColorsStore.dragStartHandler({ event: $event, originSchemaId: id, pivotId })
</script>

<template>
  <div
    class="color-card group/card p-2 items-stretch auto-rows-[2.5rem] grid gap-1.5 place-items-start grid-cols-[repeat(26,_2.5rem)] w-fit rounded-md hover:shadow-xl shadow-md transition-shadow bg-slate-50 relative group/card"
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
            :style="{ color: getContrastTextColor(scheme.leadColor.hex) }"
          >
            {{ scheme.leadColor.hex }}
          </div>

          <div
            class="group-hover/cover:opacity-100 opacity-0 transition-all absolute border-black/10 border flex flex-nowrap right-1.5 bottom-1.5 z-10 bg-sky-100/50 px-1.5 py-1 gap-1 rounded"
          >
            <NPopconfirm
              class="!font-mono"
              :showIcon="false"
              :positiveButtonProps="positiveButtonPropsHandler(id)"
              :negativeButtonProps="negativeButtonProps"
              :showArrow="true"
              placement="top"
            >
              <template #trigger>
                <NButton
                  type="error"
                  size="tiny"
                  :disabled="scheme.colors.size < 1"
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
                :value="scheme.leadColor.hex"
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
              :positiveButtonProps="positiveButtonPropsHandler(id)"
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
            class="w-full h-full absolute top-0 left-0 rounded-md transition-all duration-300 z-0"
            :style="{ backgroundColor: scheme.leadColor.hex }"
          />
        </div>
      </div>
    </div>

    <div
      v-if="!scheme.colors.size"
      class="flex flex-col items-center justify-center gap-1 text-xl text-slate-400 transition-all col-[1_/_span_20] row-span-3 w-full border-2 border-dashed rounded-md border-slate-300 opacity-0 hover:opacity-100"
    >
      <div>
        Drag and drop colors here
      </div>
      <Download :size="26" />
    </div>

    <TransitionGroup
      v-else
      name="colors-list"
      appear
      @beforeLeave="beforeLeave"
    >
      <div
        v-for="[pivotId, color] in scheme.colors"
        :key="pivotId"
        class="w-10 h-10 rounded border-2 border-black self-center"
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
  transform: scaleX(0%);
}

.colors-list-leave-active {
  position: absolute;
}
</style>
