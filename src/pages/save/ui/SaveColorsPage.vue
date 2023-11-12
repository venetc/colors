<script setup lang="ts">
import { Group, Image } from 'lucide-vue-next';
import { storeToRefs } from 'pinia';
import { markRaw, ref, toValue } from 'vue';
import { NCard, NImage, NScrollbar, NTab, NTabs } from 'naive-ui';
import { useExportConfig, useExportData } from '@/features/export-data/generate-export-data';
import { useImagesStore } from '@/entities/image';
import type { ColorCollection, ImageColor } from '@/entities/color';
import { useColorsStore } from '@/entities/color';
import { ExportDataConfig } from '@/widgets/export-data-config';

import DataPane from '@/pages/save/ui/DataPane.vue';

const colorModel = useColorsStore();
const imagesModel = useImagesStore();

const { colors } = storeToRefs(colorModel);
const { images } = storeToRefs(imagesModel);

const config = useExportConfig();
const colorDataConfig = toValue(config.colorDataConfig);
const syntaxConfig = toValue(config.syntaxConfig);

const { exportData } = useExportData({
  images,
  colors,
  config,
});

const tabs = [
  {
    name: 'colors',
    label: 'Images colors',
    icon: markRaw(Image),
  },
  {
    name: 'groups',
    label: 'Grouped images',
    icon: markRaw(Group),
  },
];

const activeTab = ref(tabs[0].name);

function getNonEmptyColors(colorCollection: ColorCollection) {
  return [...colorCollection.entries()].filter(([_, value]) => (value !== null)) as Array<[number, ImageColor]>;
}
</script>

<template>
  <section class="py-6 flex flex-nowrap justify-between items-start">
    <div class="bg-white/75 rounded-md shadow-md p-3 w-96">
      <ExportDataConfig
        v-model:colorDataConfig="colorDataConfig"
        v-model:syntaxConfig="syntaxConfig"
      />
    </div>
    <div class="bg-white/75 rounded-md shadow-md py-3">
      <div class="max-w-2xl mx-auto mb-3">
        <NTabs
          v-model:value="activeTab"
          type="segment"
          justifyContent="center"
          animated
          class="font-mono"
        >
          <NTab
            v-for="tab in tabs"
            :key="tab.name"
            :name="tab.name"
          >
            <div class="flex justify-center items-center gap-x-[6px]">
              <Component
                :is="tab.icon"
                :size="21"
                :stroke-width="1.5"
              />
              <span class="font-mono">{{ tab.label }}</span>
            </div>
          </NTab>
        </NTabs>
      </div>
      <div class="overflow-hidden">
        <DataPane>
          <template #left>
            <NScrollbar class="border rounded-md shadow-inner">
              <div class="grid grid-cols-3 gap-3 p-3">
                <NCard
                  v-for="[imageId, colorCollection] in colors"
                  :key="imageId"
                  contentStyle="padding: 0;"
                  hoverable
                  class="!rounded-md !overflow-hidden"
                >
                  <template #cover>
                    <div class="relative w-full aspect-[1.55/1]">
                      <NImage
                        class="absolute w-full h-full chess-bg"
                        :src="images.get(imageId)?.croppedSrc ?? images.get(imageId)?.blobSrc"
                        objectFit="cover"
                        :imgProps="{ crossorigin: 'anonymous', style: { width: '100%', height: '100%' } }"
                      />
                    </div>
                  </template>
                  <div class="flex flex-nowrap h-10">
                    <div
                      v-for="([staticIndex, color], index) in getNonEmptyColors(colorCollection)"
                      :key="staticIndex"
                      :style="{ backgroundColor: color.handpicked?.hex ?? color.original.hex }"
                      class="text-xs font-mono flex items-center justify-center w-full border-b border-t border-black"
                      :class="[
                        index === 0 ? 'rounded-bl-md border-l' : null,
                        index === getNonEmptyColors(colorCollection).length - 1 ? 'rounded-br-md border-r' : null,
                      ]"
                    >
                      {{ color.handpicked?.hex ?? color.original.hex }}
                    </div>
                  </div>
                </NCard>
              </div>
            </NScrollbar>
          </template>
          <template #right>
            2
          </template>
        </DataPane>
      </div>
    </div>
  </section>
</template>
