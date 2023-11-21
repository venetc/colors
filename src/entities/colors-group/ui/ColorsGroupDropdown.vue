<script setup lang="ts">
import { toRefs } from 'vue';
import { NCollapseTransition } from 'naive-ui';
import { Check, ChevronDown, ClipboardCopy } from 'lucide-vue-next';

import type { ColorGroup, ColorGroupId } from '@/entities/colors-group';

import { getContrastTextColor, shadeHexColor } from '@/shared/lib/color';

interface Props {
  colorsGroup: ColorGroup;
  isOpened: boolean;
  isCopied?: boolean;
  isCopyingSupported?: boolean;
}

const props = defineProps<Props>();

const emits = defineEmits<{
  onOpenClick: [colorGoupId: ColorGroupId];
  onCopy: [colorsGroup: ColorGroup];
}>();

const {
  colorsGroup,
  isOpened,
  isCopied,
  isCopyingSupported,
} = toRefs(props);
</script>

<template>
  <div class="shadow-md rounded-md group/chunk">
    <div
      class="h-10 border grid place-items-center font-mono text-white [text-shadow:_1px_1px_2px_#000000] rounded-t-md transition-all delay-0 relative"
      :class="{ 'rounded-b-md': !isOpened, 'delay-200': !isOpened }"
      :style="{ backgroundColor: colorsGroup.leadColor.hex, borderColor: shadeHexColor(colorsGroup.leadColor.hex, 1.1) }"
    >
      <div>
        Lead color: {{ colorsGroup.leadColor.hex.toUpperCase() }}
      </div>
      <button
        class="absolute top-1/2 right-3 gap-0.5 text-xs -translate-y-1/2 opacity-0 group-hover/chunk:opacity-100 transition-all"
        :style="{ color: getContrastTextColor(colorsGroup.leadColor.rgbArray) }"
        @click="emits('onOpenClick', colorsGroup.id)"
      >
        <ChevronDown
          :size="18"
          :stroke-width="2"
          class="transition-transform"
          :class="{ 'rotate-180': isOpened }"
        />
      </button>
      <div
        v-if="isCopyingSupported"
        class="absolute top-1/2 -translate-y-1/2 left-2 border border-white/25 p-1 rounded shadow bg-black/25 text-white cursor-pointer pointer-events-auto opacity-0 transition duration-300 group-hover/chunk:opacity-100"
        @click="emits('onCopy', colorsGroup)"
      >
        <Transition
          name="fade"
          mode="out-in"
        >
          <Component
            :is="isCopied ? Check : ClipboardCopy"
            :size="16"
          />
        </Transition>
      </div>
    </div>
    <NCollapseTransition :show="isOpened">
      <div
        :style="{ borderColor: shadeHexColor(colorsGroup.leadColor.hex, 1.1) }"
        class="p-3 border-l border-r border-b rounded-b-md"
      >
        <slot />
      </div>
    </NCollapseTransition>
  </div>
</template>
