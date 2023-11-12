<script setup lang="ts">
import { useVModels } from '@vueuse/core';
import type { ScrollbarProps } from 'naive-ui';
import { NCollapseTransition, NScrollbar, NSwitch } from 'naive-ui';
import { ref } from 'vue';
import { DEMO_COLORS, DEMO_IMAGES } from '../lib';
import { HighlightComponent } from '@/entities/export-data';
import type {
  ColorDataConfig,
  ExportDataComposableArgs,
  SyntaxConfig,
} from '@/features/export-data/generate-export-data';
import {
  ExportDataFilters,
  useExportData,
} from '@/features/export-data/generate-export-data';

const props = defineProps<{
  colorDataConfig: ColorDataConfig;
  syntaxConfig: SyntaxConfig;
}>();

const emit = defineEmits(['update:colorDataConfig', 'update:syntaxConfig']);
const {
  colorDataConfig,
  syntaxConfig,
} = useVModels(props, emit);

const payload: ExportDataComposableArgs = {
  images: DEMO_IMAGES,
  colors: DEMO_COLORS,
  config: {
    colorDataConfig,
    syntaxConfig,
  },
};

const { exportData } = useExportData(payload);

const exampleVisible = ref(false);

type ScrollbarThemeOverrides = NonNullable<ScrollbarProps['themeOverrides']>;
const scrollbarThemeOverrides: ScrollbarThemeOverrides = {
  color: 'rgba(255,255,255,0.75)',
  colorHover: 'rgba(255,255,255,0.75)',
};
</script>

<template>
  <div class="flex flex-col gap-3">
    <ExportDataFilters
      v-model:colorDataConfig="colorDataConfig"
      v-model:syntaxConfig="syntaxConfig"
    />

    <div>
      <div class="font-mono flex flex-nowrap items-center gap-1.5">
        <span class="text-sm">Example:</span>
        <NSwitch
          v-model:value="exampleVisible"
          size="small"
          :round="false"
        >
          <template #checked>
            Show
          </template>
          <template #unchecked>
            Hide
          </template>
        </NSwitch>
      </div>
    </div>

    <NCollapseTransition :show="exampleVisible">
      <NScrollbar
        xScrollable
        :themeOverrides="scrollbarThemeOverrides"
      >
        <HighlightComponent
          class="rounded overflow-hidden text-xs"
          :code="exportData"
        />
      </NScrollbar>
    </NCollapseTransition>
  </div>
</template>
