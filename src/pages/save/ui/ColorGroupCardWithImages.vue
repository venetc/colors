<script setup lang="ts">
import { toRefs } from 'vue';
import { NCollapseTransition } from 'naive-ui';
import { shadeHexColor } from '@/shared/lib/color.ts';
import type { ColorGroup, ColorGroupId } from '@/features/color/sort-colors';

interface Props {
  colorsGroup: ColorGroup;
  isOpened: boolean;
}

const props = defineProps<Props>();

const emits = defineEmits<{
  onOpenClick: [colorGoupId: ColorGroupId];
}>();

const {
  colorsGroup,
  isOpened,
} = toRefs(props);
</script>

<template>
  <div class="shadow-lg relative rounded-md">
    <div
      class="h-10 border grid place-items-center font-mono text-white [text-shadow:_0_0_8px_#000000] rounded-t-md transition-all delay-0"
      :class="{ 'rounded-b-md': !isOpened, 'delay-200': !isOpened }"
      :style="{ backgroundColor: colorsGroup.leadColor.hex, borderColor: shadeHexColor(colorsGroup.leadColor.hex, 1.1) }"
    >
      {{ colorsGroup.leadColor.hex }}
    </div>
    <div
      class="absolute top-0 right-0 [text-shadow:_0_0_8px_#000000] text-white"
      @click="emits('onOpenClick', colorsGroup.id)"
    >
      show
    </div>
    <NCollapseTransition :show="isOpened">
      <div
        class="grid grid-cols-2 gap-3 p-3 border-l border-r border-b rounded-b-md"
        :style="{ borderColor: shadeHexColor(colorsGroup.leadColor.hex, 1.1) }"
      >
        <slot />
      </div>
    </NCollapseTransition>
  </div>
</template>
