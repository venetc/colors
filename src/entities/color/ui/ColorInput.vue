<script setup lang="ts">
import { refThrottled } from '@vueuse/core';
import { NButton } from 'naive-ui';
import { onMounted, ref, toRefs, watch } from 'vue';
import { Palette } from 'lucide-vue-next';
import { generateColorData } from '../lib';
import type { Color } from '../lib';
import { hexToRGB } from '@/shared/lib/color';

const props = defineProps<{ defaultColor: string }>();
const emit = defineEmits<{
  onColorPick: [color: Color];
}>();

const { defaultColor } = toRefs(props);

const inputRef = ref<HTMLInputElement>();

const _color = ref<string>();
const debouncedColor = refThrottled(_color, 200);

function clickHandler() {
  if (inputRef.value) inputRef.value.click();
}

onMounted(() => {
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
  <label class="overflow-hidden relative flex items-center content-center">
    <input
      ref="inputRef"
      v-model="_color"
      type="color"
      class="opacity-0 pointer-events-none absolute w-0 h-0 bottom-0 left-0"
    >
    <NButton
      type="info"
      size="tiny"
      @click="clickHandler"
    >
      <template #icon>
        <Palette :size="16" />
      </template>
    </NButton>
  </label>
</template>
