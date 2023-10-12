<script setup lang="ts">
import { RotateCcw, X } from 'lucide-vue-next';
import type { ButtonProps } from 'naive-ui';
import { NButton, NPopconfirm, NPopover } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { toRefs } from 'vue';
import EyeDropper from '../ui/EyeDropper.vue';
import ColorInput from '../ui/ColorInput.vue';
import ColorCell from '../ui/ColorCell.vue';
import type { ImageColor } from '@/entities/color';
import { useColorsStore } from '@/entities/color';

const props = defineProps<{ imageToken: string; compact?: boolean }>();
const { imageToken, compact } = toRefs(props);

const colorsStore = useColorsStore();
const { colors } = storeToRefs(colorsStore);
const { setColor, clearSelectedColor, removeColorCompletely } = colorsStore;

function positiveButtonPropsHandler(token: string, color: ImageColor): ButtonProps {
  return {
    size: 'tiny',
    type: 'success',
    onClick: () => removeColorCompletely(token, color),
  };
}

const negativeButtonProps: ButtonProps = {
  size: 'tiny',
  type: 'error',
};
</script>

<template>
  <TransitionGroup name="colors-list">
    <div
      v-for="color in colors.get(imageToken)"
      :key="`${imageToken}/${color.original.hex}`"
    >
      <NPopover
        trigger="hover"
        class="!font-mono rounded-lg"
        :placement="compact ? 'left' : 'bottom'"
        raw
        :showArrow="false"
        :duration="200"
      >
        <template #trigger>
          <div :class="[compact ? 'w-full h-9' : 'w-8 h-12 xl:w-12 xl:h-12']">
            <ColorCell :color="color" />
          </div>
        </template>

        <div
          class="flex flex-nowrap gap-1 items-start content-start px-2 py-1.5"
          :class="[compact ? 'bg-gradient-to-br from-slate-100/25 to-slate-400/25 rounded-lg shadow-lg mr-1.5' : 'rounded shadow bg-white']"
        >
          <EyeDropper @onColorPick="setColor($event, color)" />

          <ColorInput
            :defaultColor="color.selected?.hex ?? color.original.hex"
            @onColorPick="setColor($event, color)"
          />

          <NButton
            :disabled="!color.selected"
            type="error"
            size="tiny"
            @click="clearSelectedColor(color)"
          >
            <template #icon>
              <RotateCcw :size="16" />
            </template>
          </NButton>

          <NPopconfirm
            class="!font-mono"
            :class="[compact ? 'bg-gradient-to-br from-slate-100/25 to-slate-400/25 rounded-lg shadow-lg px-2 py-1.5 !text-sm !text-white !mb-2.5 -mr-1.5' : '']"
            :showIcon="false"
            :positiveButtonProps="positiveButtonPropsHandler(imageToken, color)"
            :negativeButtonProps="negativeButtonProps"
            :raw="compact"
            :showArrow="!compact"
            :placement="compact ? 'top-end' : 'top'"
          >
            <template #trigger>
              <NButton
                type="error"
                size="tiny"
              >
                <template #icon>
                  <X :size="16" />
                </template>
              </NButton>
            </template>
            Remove color?
          </NPopconfirm>
        </div>
      </NPopover>
    </div>
  </TransitionGroup>
</template>

<style>
.colors-list-move,
.colors-list-enter-active,
.colors-list-leave-active {
  transition: all 0.3s ease;
}

.colors-list-enter-from,
.colors-list-leave-to {
  opacity: 0;
}

.colors-list-leave-active {
  position: absolute;
}
</style>
