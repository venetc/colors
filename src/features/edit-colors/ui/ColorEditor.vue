<script setup lang="ts">
import { RotateCcw, X } from 'lucide-vue-next';
import { NButton, NPopconfirm, NPopover } from 'naive-ui';
import { toRefs } from 'vue';

import type { ButtonProps } from 'naive-ui';
import type { Color, ImageColor } from '@/entities/color';

import EyeDropper from '@/features/edit-colors/ui/EyeDropper.vue';
import ColorInput from '@/features/edit-colors/ui/ColorInput.vue';

const props = defineProps<{
  imageColor: ImageColor;
  compact?: boolean;
}>();
const emits = defineEmits<{
  onDelete: [];
  onColorPick: [newColor: Color];
  onResetHandpicked: [imageColor: ImageColor];
}>();

const { compact, imageColor } = toRefs(props);

const positiveButtonProps: ButtonProps = {
  size: 'tiny',
  type: 'success',
  onClick: () => emits('onDelete'),
};
const negativeButtonProps: ButtonProps = {
  size: 'tiny',
  type: 'error',
};
</script>

<template>
  <NPopover
    trigger="hover"
    class="!font-mono rounded-lg"
    :placement="compact ? 'left' : 'bottom'"
    raw
    :showArrow="false"
    :duration="200"
    displayDirective="show"
  >
    <template #trigger>
      <slot />
    </template>

    <div
      class="flex flex-nowrap gap-1 items-start content-start  rounded"
      :class="[compact ? 'bg-gradient-to-br from-slate-100/25 to-slate-400/25 shadow-lg mr-1.5 px-2 py-1.5' : 'shadow bg-white flex-col px-1.5 py-1.5']"
    >
      <EyeDropper @onColorPick="emits('onColorPick', $event)" />

      <ColorInput
        :defaultColor="imageColor.handpicked?.hex ?? imageColor.original.hex"
        @onColorPick="emits('onColorPick', $event)"
      />

      <NButton
        :disabled="!imageColor.handpicked"
        type="error"
        size="tiny"
        @click="emits('onResetHandpicked', imageColor)"
      >
        <template #icon>
          <RotateCcw :size="16" />
        </template>
      </NButton>

      <NPopconfirm
        class="!font-mono"
        :class="[compact ? 'bg-gradient-to-br from-slate-100/25 to-slate-400/25 rounded-lg shadow-lg px-2 py-1.5 !text-sm !text-white !mb-2.5 -mr-1.5' : '']"
        :showIcon="false"
        :positiveButtonProps="positiveButtonProps"
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
</template>
