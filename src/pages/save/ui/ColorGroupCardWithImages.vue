<script setup lang="ts">
import { toRefs } from 'vue';
import { NCollapseTransition } from 'naive-ui';
import { shadeHexColor } from '@/shared/lib/color.ts';
import type { ColorScheme, SchemeId } from '@/features/color/sort-colors';

interface Props {
  scheme: ColorScheme;
  isOpened: boolean;
}

const props = defineProps<Props>();

const emits = defineEmits<{
  onOpenClick: [schemeId: SchemeId];
}>();

const {
  scheme,
  isOpened,
} = toRefs(props);
</script>

<template>
  <div class="shadow-lg relative rounded-md">
    <div
      class="h-10 border grid place-items-center font-mono text-white [text-shadow:_0_0_8px_#000000] rounded-t-md transition-all delay-0"
      :class="{ 'rounded-b-md': !isOpened, 'delay-200': !isOpened }"
      :style="{ backgroundColor: scheme.leadColor.hex, borderColor: shadeHexColor(scheme.leadColor.hex, 1.1) }"
    >
      {{ scheme.leadColor.hex }}
    </div>
    <div
      class="absolute top-0 right-0 [text-shadow:_0_0_8px_#000000] text-white"
      @click="emits('onOpenClick', scheme.id)"
    >
      show
    </div>
    <NCollapseTransition :show="isOpened">
      <div
        class="grid grid-cols-2 gap-3 p-3 border-l border-r border-b rounded-b-md"
        :style="{ borderColor: shadeHexColor(scheme.leadColor.hex, 1.1) }"
      >
        <slot />
      </div>
    </NCollapseTransition>
  </div>
</template>
