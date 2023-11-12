<script setup lang="ts">
import { useVModels } from '@vueuse/core';
import { NCheckbox } from 'naive-ui';
import type { ColorDataConfig, SyntaxConfig } from '../model';

const props = defineProps<{
  colorDataConfig: ColorDataConfig;
  syntaxConfig: SyntaxConfig;
}>();

const emit = defineEmits(['update:colorDataConfig', 'update:syntaxConfig']);

const {
  colorDataConfig,
  syntaxConfig,
} = useVModels(props, emit);
</script>

<template>
  <div class="flex flex-col gap-1.5 items-start font-mono">
    <div class="grid grid-rows-3 grid-flow-col gap-1.5 w-full">
      <NCheckbox
        v-for="switcher in colorDataConfig"
        :key="switcher.label"
        v-model:checked="switcher.isIncluded"
        size="medium"
      >
        {{ switcher.label }}
      </NCheckbox>
    </div>
    <NCheckbox
      v-for="switcher in syntaxConfig"
      :key="switcher.label"
      v-model:checked="switcher.isActive"
      size="medium"
    >
      {{ switcher.label }}
    </NCheckbox>
  </div>
</template>
