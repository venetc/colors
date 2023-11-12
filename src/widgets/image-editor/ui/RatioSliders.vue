<script setup lang="ts">
import { useVModels } from '@vueuse/core';
import { NSlider } from 'naive-ui';
import { ChevronsLeftRight, ChevronsUpDown } from 'lucide-vue-next';

const props = defineProps<{
  width: number;
  height: number;
}>();

const emit = defineEmits(['update:width', 'update:height']);
const {
  width,
  height,
} = useVModels(props, emit);

const formatTooltip = (value: number) => `${value}%`;

const railStyle = {
  '--n-fill-color': 'rgba(255,255,255,0.35)',
  '--n-rail-color': 'rgba(0,0,0,0.15)',
  '--n-fill-color-hover': 'rgba(255,255,255,0.35)',
  '--n-rail-color-hover': 'rgba(0,0,0,0.15)',
};
</script>

<template>
  <div
    class="flex flex-col gap-2"
  >
    <NSlider
      v-model:value="width"
      :formatTooltip="formatTooltip"
      :min="10"
      :max="100"
      :style="railStyle"
    >
      <template #thumb>
        <div class="bg-white text-black rounded-full p-0.5">
          <ChevronsLeftRight :size="16" />
        </div>
      </template>
    </NSlider>
    <NSlider
      v-model:value="height"
      :formatTooltip="formatTooltip"
      :min="10"
      :max="100"
      :style="railStyle"
    >
      <template #thumb>
        <div class="bg-white text-black rounded-full p-0.5">
          <ChevronsUpDown :size="16" />
        </div>
      </template>
    </NSlider>
  </div>
</template>
