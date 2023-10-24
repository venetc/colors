<script setup lang="ts">
import { RotateCcw, X } from 'lucide-vue-next';
import type { ButtonProps } from 'naive-ui';
import { NButton, NPopconfirm, NPopover } from 'naive-ui';
import { computed, toRefs } from 'vue';
import EyeDropper from '../ui/EyeDropper.vue';
import ColorInput from '../ui/ColorInput.vue';
import ColorCell from '../ui/ColorCell.vue';
import { beforeLeaveWorkaround } from '@/shared/lib/crutch';
import type { Color, ColorCollection, ImageColor } from '@/entities/color';

const props = defineProps<{ colors?: ColorCollection; compact?: boolean }>();
const emits = defineEmits<{
  onDelete: [index: number];
  onColorPick: [newColor: Color, index: number];
  onResetHandpicked: [imageColor: ImageColor];
}>();

const {
  compact,
  colors,
} = toRefs(props);

function positiveButtonPropsHandler(indexKey: number): ButtonProps {
  return {
    size: 'tiny',
    type: 'success',
    onClick: () => emits('onDelete', indexKey),
  };
}

const negativeButtonProps: ButtonProps = {
  size: 'tiny',
  type: 'error',
};

const _colors = computed(() => {
  if (!colors?.value) return [] as Array<[number, ImageColor]>;

  return [...colors.value.entries()].filter(([_, value]) => (value !== null)) as Array<[number, ImageColor]>;
});
</script>

<template>
  <TransitionGroup
    v-if="colors"
    name="colors-list"
    appear
    @beforeLeave="beforeLeaveWorkaround"
  >
    <div
      v-for="[indexKey, imageColor] in _colors"
      :key="indexKey"
    >
      <template v-if="imageColor">
        <NPopover
          trigger="hover"
          class="!font-mono rounded-lg"
          :placement="compact ? 'left' : 'bottom'"
          raw
          :showArrow="false"
          :duration="200"
        >
          <template #trigger>
            <div :class="[compact ? 'w-[88px] h-9' : 'w-8 h-12 xl:w-12 xl:h-12']">
              <ColorCell :color="imageColor" />
            </div>
          </template>

          <div
            class="flex flex-nowrap gap-1 items-start content-start  rounded"
            :class="[compact ? 'bg-gradient-to-br from-slate-100/25 to-slate-400/25 shadow-lg mr-1.5 px-2 py-1.5' : 'shadow bg-white flex-col px-1.5 py-1.5']"
          >
            <EyeDropper @onColorPick="emits('onColorPick', $event, indexKey)" />

            <ColorInput
              :defaultColor="imageColor.handpicked?.hex ?? imageColor.original.hex"
              @onColorPick="emits('onColorPick', $event, indexKey)"
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
              :positiveButtonProps="positiveButtonPropsHandler(indexKey)"
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
    </div>
  </TransitionGroup>
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
}

.colors-list-leave-active {
  position: absolute;
}
</style>
