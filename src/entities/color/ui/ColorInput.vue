<script setup lang="ts">
import { refThrottled } from '@vueuse/core';
import { NButton } from 'naive-ui';
import { ref, toRefs, watch } from 'vue';
import { Palette } from 'lucide-vue-next';
import { generateColorData } from '../lib';
import type { Color } from '../lib';
import { hexToRGB } from '@/shared/lib/color';

const props = defineProps<{ defaultColor: string }>();
const emit = defineEmits<{
  onColorPick: [color: Color];
}>();

const { defaultColor } = toRefs(props);

const _color = ref<string>();
const debouncedColor = refThrottled(_color, 200);

watch(defaultColor, () => {
  _color.value = defaultColor.value;
});

watch(debouncedColor, (colorValue) => {
  if (colorValue && (colorValue !== defaultColor.value)) {
    const color = generateColorData(hexToRGB(colorValue));

    emit('onColorPick', color);
  }
});
</script>

<template>
  <div class="overflow-hidden relative flex items-center content-center">
    <input
      v-model="_color"
      type="color"
      class="opacity-0 absolute w-full h-full cursor-pointer bottom-0 left-0 z-10"
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
</template>
