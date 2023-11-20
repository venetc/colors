<script setup lang="ts">
import { UseClipboard } from '@vueuse/components';
import { Check, ClipboardCopy } from 'lucide-vue-next';
import { NTab, NTabs } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';

import type { ColorGroup, ColorGroupId } from '@/entities/colors-group';
import type { ImageId, Img } from '@/entities/image';

import { useColorGroups } from '@/entities/colors-group';
import { useImages } from '@/entities/image';
import { ExportDataPreview, useExportData, useExportDataConfig, usePreviewTabs } from '@/features/export-data';
import ColorGroupCardWithImages from '@/pages/save/ui/ColorGroupCardWithImages.vue';
import DataPane from '@/pages/save/ui/DataPane.vue';
import ExportImageCard from '@/pages/save/ui/ExportImageCard.vue';
import { WithImageColors } from '@/pages/save/ui/withImageColors';
import { ExportDataConfig } from '@/widgets/export-data-config';

const imagesModel = useImages();
// const colorsModel = useColors();
const colorGroupsModel = useColorGroups();
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
const { colorGroups } = storeToRefs(colorGroupsModel);

const exportDataModel = useExportData(config, previewTabs.activeTab);

const {
  imagesData,
  colorGroupsData,
} = exportDataModel;

function findImageToCopy(image: Img) {
  const searchToken = image.origin === 'file' ? image.fileName : image.originalSrc;

  const result = imagesData.value.find(imageObject => imageObject.image === searchToken);

  return JSON.stringify(result, null, 2);
}

function findGroupToCopy(colorGroup: ColorGroup) {
  const result = colorGroupsData.value.find((group) => {
    if ('groupId' in group) return group.groupId === colorGroup.id;

    return undefined;
  });

  return JSON.stringify(result, null, 2);
}

function getImagesFromColorGroup(colorGroup: ColorGroup) {
  const imagesFromColorGroup: Img[] = [];

  const imageIds = new Set<ImageId>();

  colorGroup.colors.forEach((ImageColor) => {
    imageIds.add(ImageColor.imageId);
  });

  imageIds.forEach((imageId) => {
    const img = images.value.get(imageId);
    if (!img) return;

    imagesFromColorGroup.push(img);
  });

  return imagesFromColorGroup;
}

const imagesBlobLink = ref<{
  link: string;
  filename: string;
}>({
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

  const filename = `image-colors_${dateString}_${hours}-${minutes}-${seconds}`;

  imagesBlobLink.value = {
    link: URL.createObjectURL(blob),
    filename,
  };
}, {
  immediate: true,
  deep: true,
});

const activeColorGroupId = ref<ColorGroupId>();

function updateFileName(token: string) {
  const date = new Date();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  const dateString = `${day}-${month}-${year}`;

  imagesBlobLink.value.filename = `${token}_${dateString}_${hours}-${minutes}-${seconds}`;
}
</script>

<template>
  <section class="py-6 flex flex-nowrap justify-between items-start space-x-5">
    <div class="bg-white/75 rounded-md shadow-md p-3 min-w-[24rem] w-96 sticky top-16">
      <a
        class="border inline-block rounded font-mono px-2 shadow py-0.5 my-2 cursor-pointer"
        :href="imagesBlobLink.link"
        :download="imagesBlobLink.filename"
        @click="updateFileName('image-colors')"
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
                  v-for="[, img] in images"
                  :key="img.id"
                  v-slot="{ copy: copyImageData, copied: imageDataCopied, isSupported: isCopyingSupported }"
                >
                  <WithImageColors v-slot="{ imageColors, getColorsByImageId }">
                    <ExportImageCard
                      :image="img"
                      :imageColors="imageColors"
                      :isCopied="imageDataCopied"
                      :isCopyingSupported="isCopyingSupported"
                      @onCopy="copyImageData(findImageToCopy($event))"
                      @onLoad="getColorsByImageId($event.id)"
                    />
                  </WithImageColors>
                </UseClipboard>
              </div>
              <div
                v-else
                class="p-3 space-y-3"
              >
                <UseClipboard
                  v-for="[, colorGroup] in colorGroups"
                  :key="colorGroup.id"
                  v-slot="{ copy: copyGroupData, copied: groupDataCopied, isSupported: isCopyingSupported }"
                >
                  <ColorGroupCardWithImages
                    :colorsGroup="colorGroup"
                    :isOpened="activeColorGroupId === colorGroup.id"
                    :isCopyingSupported="isCopyingSupported"
                    :isCopied="groupDataCopied"
                    @onOpenClick="activeColorGroupId === $event ? activeColorGroupId = undefined : activeColorGroupId = $event"
                    @onCopy="copyGroupData(findGroupToCopy($event))"
                  >
                    <UseClipboard
                      v-for="img in getImagesFromColorGroup(colorGroup)"
                      :key="img.id"
                      v-slot="{ copy: copyImageData, copied: imageDataCopied }"
                    >
                      <WithImageColors v-slot="{ imageColors, getColorsByImageId }">
                        <ExportImageCard
                          :image="img"
                          :imageColors="imageColors"
                          :isCopied="imageDataCopied"
                          :isCopyingSupported="isCopyingSupported"
                          @onCopy="copyImageData(findImageToCopy($event))"
                          @onLoad="getColorsByImageId($event.id)"
                        />
                      </WithImageColors>
                    </UseClipboard>
                  </ColorGroupCardWithImages>
                </UseClipboard>
              </div>
            </Transition>
          </div>
        </template>
        <template #right>
          <div class="border rounded-md shadow-inner p-3 relative">
            <Transition
              name="fade-slower"
              mode="out-in"
            >
              <div
                :key="activeTab"
                class="group/preview"
              >
                <UseClipboard v-slot="{ copy, copied, isSupported }">
                  <ExportDataPreview
                    :code="JSON.stringify(activeTab === 'colors' ? imagesData : colorGroupsData, null, 2)"
                    class="rounded overflow-hidden text-xs"
                    raw
                  />
                  <div
                    v-if="isSupported"
                    class="absolute top-6 right-6 border border-white/25 p-1 rounded shadow bg-black/25 text-white cursor-pointer pointer-events-auto opacity-0 transition duration-300 group-hover/preview:opacity-100"
                    @click="copy(JSON.stringify(activeTab === 'colors' ? imagesData : colorGroupsData, null, 2))"
                  >
                    <Transition
                      name="fade"
                      mode="out-in"
                    >
                      <Component
                        :is="copied ? Check : ClipboardCopy"
                        :size="16"
                      />
                    </Transition>
                  </div>
                </UseClipboard>
              </div>
            </Transition>
          </div>
        </template>
      </DataPane>
    </div>
  </section>
</template>
