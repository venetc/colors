<script setup lang="ts">
import { generateColorData } from '../../../../entities/color/lib';

import { useEyeDropper } from '@vueuse/core';
import { Pipette } from 'lucide-vue-next';
import { NButton } from 'naive-ui';
import { watch } from 'vue';

import type { Color } from '../../../../entities/color/lib';

import { hexToRGB } from '@/shared/lib/color.ts';

const emit = defineEmits<{
  onColorPick: [color: Color];
}>();

const {
  open,
  isSupported,
  sRGBHex,
} = useEyeDropper();

watch(sRGBHex, (colorValue) => {
  const color = generateColorData(hexToRGB(colorValue));

  emit('onColorPick', color);
});
</script>

<template>
  <NButton
    v-if="isSupported"
    type="primary"
    size="tiny"
    @click="open()"
  >
    <template #icon>
      <Pipette :size="16" />
    </template>
  </NButton>
</template>
