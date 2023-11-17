<script setup lang="ts">
import { UseClipboard } from '@vueuse/components';
import { NTab, NTabs } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import ColorGroupCardWithImages from '@/pages/save/ui/ColorGroupCardWithImages.vue';

// import { useColorsStore } from '@/entities/color';
import HighlightComponent from '@/entities/export-data/ui/HighlightComponent.vue';
import type { ImageId, Img } from '@/entities/image';
import { useImagesStore } from '@/entities/image';
import type { ColorScheme, SchemeId } from '@/features/color/sort-colors';
import { useSortedColorsStore } from '@/features/color/sort-colors';
import { useExportData, useExportDataConfig, usePreviewTabs } from '@/features/export-data/generate-export-data';
import DataPane from '@/pages/save/ui/DataPane.vue';
import ExportImageCard from '@/pages/save/ui/ExportImageCard.vue';
import { ImageCardHOC } from '@/pages/save/ui/ImageCardHOC.ts';
import { ExportDataConfig } from '@/widgets/export-data-config';

const imagesModel = useImagesStore();
// const colorsModel = useColorsStore();
const sortedColorsModel = useSortedColorsStore();
const config = useExportDataConfig();
const previewTabs = usePreviewTabs();

const {
  tabs,
  activeTab,
} = previewTabs;

const {
  colorDataConfig,
  syntaxConfig,
} = config;

const {
  downloadOrigin,
  images,
} = storeToRefs(imagesModel);
// const { colors } = storeToRefs(colorsModel);
const { colorSchemes } = storeToRefs(sortedColorsModel);

const exportDataStore = useExportData(config, previewTabs.activeTab);

const {
  imagesData,
  schemesData,
} = exportDataStore;

/* function getImagesSrc(imageToken: string) {
  const image = [...images.value.values()].find((img) => {
    const searchToken = img.origin === 'file' ? img.fileName : img.originalSrc;

    return searchToken === imageToken;
  });

  return image?.croppedSrc ?? image?.blobSrc ?? '';
} */

/* function getColors(imageId: ImageId) {
  const imageColors = colors.value.get(imageId);
  if (!imageColors) return [];

  return [...imageColors.values()]
    .filter((color): color is ImageColor => !!color)
    .map(color => color.handpicked ?? color.original);
} */

function findDataToCopy(image: Img) {
  const searchToken = image.origin === 'file' ? image.fileName : image.originalSrc;

  return imagesData.value.find(imageObject => imageObject.image === searchToken);
}

function getImagesFromScheme(scheme: ColorScheme) {
  const imagesFromScheme: Img[] = [];

  const imageIds = new Set<ImageId>();

  scheme.colors.forEach((ImageColor) => {
    imageIds.add(ImageColor.imageId);
  });

  imageIds.forEach((imageId) => {
    const img = images.value.get(imageId);
    if (!img) return;

    imagesFromScheme.push(img);
  });

  return imagesFromScheme;
}

const imagesBlobLink = ref<{ link: string; filename: string }>({
  link: '',
  filename: '',
});

watch(imagesData, (newData) => {
  if (imagesBlobLink.value) {
    URL.revokeObjectURL(imagesBlobLink.value.link);
    imagesBlobLink.value = {
      link: '',
      filename: '',
    };
  }

  const blob = new Blob([JSON.stringify(newData)], { type: 'application/json' });

  const date = new Date();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  const dateString = `${day}-${month}-${year}`;
  const location = window.location.hostname;

  const filename = `image-colors-${location}_${dateString}_${hours}-${minutes}-${seconds}`;

  imagesBlobLink.value = {
    link: URL.createObjectURL(blob),
    filename,
  };
}, {
  immediate: true,
  deep: true,
});

const activeSchemeId = ref<SchemeId>();
</script>

<template>
  <section class="py-6 flex flex-nowrap justify-between items-start space-x-5">
    <div class="bg-white/75 rounded-md shadow-md p-3 min-w-[24rem] w-96 sticky top-16">
      <a
        class="border inline-block rounded font-mono px-2 shadow py-0.5 my-2 cursor-pointer"
        :href="imagesBlobLink.link"
        :download="imagesBlobLink.filename"
        @load="console.log"
      >
        Download
      </a>
      <ExportDataConfig
        v-model:colorDataConfig="colorDataConfig"
        v-model:syntaxConfig="syntaxConfig"
        :origin="downloadOrigin"
        :currentTab="previewTabs.activeTab"
      />
    </div>
    <div class="bg-white/75 rounded-md shadow-md py-3 w-2/3">
      <div class="max-w-[75%] w-full mx-auto">
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
      <DataPane>
        <template #left>
          <div class="border rounded-md shadow-inner">
            <Transition
              name="fade-slower"
              mode="out-in"
            >
              <div
                v-if="activeTab === 'colors'"
                class="grid grid-cols-2 gap-3 p-3"
              >
                <UseClipboard
                  v-for="[imageId, img] in images"
                  v-slot="{ copy, copied, isSupported }"
                  :key="imageId"
                >
                  <ImageCardHOC v-slot="{ imageColors, getColors }">
                    <ExportImageCard
                      :image="img"
                      :colors="imageColors"
                      :isCopied="copied"
                      :isCopyingSupported="isSupported"
                      @onCopy="copy(JSON.stringify(findDataToCopy($event), null, 2))"
                      @onLoad="getColors($event.id)"
                    />
                  </ImageCardHOC>
                </UseClipboard>
              </div>
              <div
                v-else
                class="p-3 space-y-3"
              >
                <ColorGroupCardWithImages
                  v-for="[schemeId, scheme] in colorSchemes"
                  :key="schemeId"
                  :scheme="scheme"
                  :isOpened="activeSchemeId === schemeId"
                  @onOpenClick="activeSchemeId === $event ? activeSchemeId = undefined : activeSchemeId = $event"
                >
                  <UseClipboard
                    v-for="img in getImagesFromScheme(scheme)"
                    v-slot="{ copy: copyImageData, copied: imageDataCopied, isSupported: isCopyingSupported }"
                    :key="img.id"
                  >
                    <ImageCardHOC v-slot="{ imageColors, getColors }">
                      <ExportImageCard
                        :image="img"
                        :colors="imageColors"
                        :isCopied="imageDataCopied"
                        :isCopyingSupported="isCopyingSupported"
                        @onCopy="copyImageData(JSON.stringify(findDataToCopy($event), null, 2))"
                        @onLoad="getColors($event.id)"
                      />
                    </ImageCardHOC>
                  </UseClipboard>
                </ColorGroupCardWithImages>
              </div>
            </Transition>
          </div>
        </template>
        <template #right>
          <div class="border rounded-md shadow-inner p-3">
            <Transition
              name="fade-slower"
              mode="out-in"
            >
              <HighlightComponent
                :key="activeTab"
                :code="JSON.stringify(activeTab === 'colors' ? imagesData : schemesData, null, 2)"
                class="rounded overflow-hidden text-xs"
                raw
              />
            </Transition>
          </div>
        </template>
      </DataPane>
    </div>
  </section>
</template>
