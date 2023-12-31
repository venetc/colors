<script setup lang="ts">
import { DEMO_COLORS, DEMO_COLOR_GROUPS, DEMO_FILE_IMAGES, DEMO_LINK_IMAGES } from '../lib';

import { useVModels } from '@vueuse/core';
import { NCollapseTransition, NScrollbar, NSwitch } from 'naive-ui';
import { ref, toRefs } from 'vue';

import type { ScrollbarProps } from 'naive-ui';
import type { Ref } from 'vue';
import type { ColorDataConfig, ExportDataOrigin, SyntaxConfig } from '@/features/export-data';

import { ExportDataFilters, ExportDataPreview, useExportData } from '@/features/export-data';

const props = defineProps<{
  colorDataConfig: ColorDataConfig;
  syntaxConfig: SyntaxConfig;
  origin: 'images' | 'txt' | 'links' | undefined;
  currentTab: Ref<'colors' | 'groups'>;
}>();

const emit = defineEmits(['update:colorDataConfig', 'update:syntaxConfig']);

const {
  origin,
  currentTab,
} = toRefs(props);

const {
  colorDataConfig,
  syntaxConfig,
} = useVModels(props, emit);

const demoOrigin: ExportDataOrigin = {
  images: origin.value === 'images' ? DEMO_FILE_IMAGES : DEMO_LINK_IMAGES,
  colors: DEMO_COLORS,
  colorGroups: DEMO_COLOR_GROUPS,
};

const {
  imagesData,
  colorGroupsData,
} = useExportData({
  colorDataConfig,
  syntaxConfig,
}, currentTab, demoOrigin);

const exampleVisible = ref(false);

type ScrollbarThemeOverrides = NonNullable<ScrollbarProps['themeOverrides']>;
const scrollbarThemeOverrides: ScrollbarThemeOverrides = {
  color: 'rgba(255,255,255,0.75)',
  colorHover: 'rgba(255,255,255,0.75)',
};
</script>

<template>
  <div class="flex flex-col space-y-3">
    <ExportDataFilters
      v-model:colorDataConfig="colorDataConfig"
      v-model:syntaxConfig="syntaxConfig"
    />

    <slot />

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

    <NCollapseTransition :show="exampleVisible">
      <NScrollbar
        xScrollable
        :themeOverrides="scrollbarThemeOverrides"
      >
        <Transition
          name="fade-slower"
          mode="out-in"
        >
          <ExportDataPreview
            :key="currentTab"
            class="rounded overflow-hidden text-xs"
            :code="JSON.stringify(currentTab === 'colors' ? imagesData : colorGroupsData, null, 2)"
          />
        </Transition>
      </NScrollbar>
    </NCollapseTransition>
  </div>
</template>
