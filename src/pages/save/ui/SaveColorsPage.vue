<script setup lang="ts">
import { UseClipboard } from '@vueuse/components';
import { Check, ClipboardCopy, Group, Image } from 'lucide-vue-next';
import { NButton, NTab, NTabs } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

import type { ColorGroup, ColorGroupId } from '@/entities/colors-group';
import type { ImageId, Img } from '@/entities/image';

import { ColorsGroupDropdown, useColorGroups } from '@/entities/colors-group';
import { useImages } from '@/entities/image';
import {
  ExportDataPreview,
  useExportData,
  useExportDataConfig,
  useFileDownload,
  usePreviewTabs,
} from '@/features/export-data';
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
const { nonEmptyColorGroups } = storeToRefs(colorGroupsModel);

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
  const result = colorGroupsData.value.find(group => 'groupId' in group ? group.groupId === colorGroup.id : undefined);

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

const someColorGroupsNotEmpty = computed(() => nonEmptyColorGroups.value.length > 0);

const activeColorGroupId = ref<ColorGroupId>();

const {
  link: imagesLink,
  filename: imagesFilename,
  updateFileName: imagesUpdateFileName,
} = useFileDownload(imagesData, 'image-colors');
const {
  link: groupsLink,
  filename: groupsFilename,
  updateFileName: groupsUpdateFileName,
} = useFileDownload(colorGroupsData, 'color-groups');

const isColorTabOrSomeGroupsNotEmpty = computed(() => {
  const colorTabActive = activeTab.value === 'colors';
  const groupsTabActive = activeTab.value === 'groups';
  const someGroupsNotEmpty = someColorGroupsNotEmpty.value;

  return colorTabActive || (groupsTabActive && someGroupsNotEmpty);
});
</script>

<template>
  <section class="py-6 flex flex-nowrap justify-between items-start space-x-5">
    <div class="bg-white/75 rounded-md shadow-md p-3 min-w-[24rem] w-96 sticky top-16">
      <ExportDataConfig
        v-model:colorDataConfig="colorDataConfig"
        v-model:syntaxConfig="syntaxConfig"
        :origin="downloadOrigin"
        :currentTab="previewTabs.activeTab"
      >
        <div class="font-mono flex items-center gap-1.5">
          <span class="text-sm">Download JSON:</span>
          <NButton
            type="primary"
            size="tiny"
            tag="a"
            class="!font-thin"
            :href="imagesLink"
            :download="imagesFilename"
            @click="imagesUpdateFileName"
          >
            <template #icon>
              <Image
                :size="18"
                :stroke-width="1.75"
              />
            </template>
            <template #default>
              Images
            </template>
          </NButton>
          <NButton
            v-if="someColorGroupsNotEmpty"
            type="primary"
            size="tiny"
            tag="a"
            class="!font-thin"
            :href="groupsLink"
            :download="groupsFilename"
            @click="groupsUpdateFileName"
          >
            <template #icon>
              <Group
                :size="18"
                :stroke-width="1.75"
              />
            </template>
            <template #default>
              Groups
            </template>
          </NButton>
        </div>
      </ExportDataConfig>
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
      <DataPane :isSwitcherVisible="isColorTabOrSomeGroupsNotEmpty">
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
              <template v-else>
                <div
                  v-if="someColorGroupsNotEmpty"
                  class="p-3 space-y-3"
                >
                  <UseClipboard
                    v-for="colorGroup in nonEmptyColorGroups"
                    :key="colorGroup.id"
                    v-slot="{ copy: copyGroupData, copied: groupDataCopied, isSupported: isCopyingSupported }"
                  >
                    <ColorsGroupDropdown
                      :colorsGroup="colorGroup"
                      :isOpened="activeColorGroupId === colorGroup.id"
                      :isCopyingSupported="isCopyingSupported"
                      :isCopied="groupDataCopied"
                      @onOpenClick="activeColorGroupId === $event ? activeColorGroupId = undefined : activeColorGroupId = $event"
                      @onCopy="copyGroupData(findGroupToCopy($event))"
                    >
                      <div class="grid grid-cols-2 gap-3">
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
                      </div>
                    </ColorsGroupDropdown>
                  </UseClipboard>
                </div>
                <div
                  v-else
                  class="flex flex-col items-center justify-center font-mono h-[354px]"
                >
                  <span class="text-lg">No image groups,</span>
                  <span class="text-lg">or all of them are empty</span>
                  <span class="text-2xl mt-2">😢</span>
                </div>
              </template>
            </Transition>
          </div>
        </template>
        <template #right>
          <div class="border rounded-md shadow-inner p-3 relative">
            <Transition
              name="fade-slower"
              mode="out-in"
            >
              <template v-if="isColorTabOrSomeGroupsNotEmpty">
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
              </template>
              <div
                v-else
                class="flex flex-col items-center justify-center font-mono h-[354px]"
              >
                <span class="text-lg">No image groups,</span>
                <span class="text-lg">or all of them are empty</span>
                <span class="text-2xl mt-2">😢</span>
              </div>
            </Transition>
          </div>
        </template>
      </DataPane>
    </div>
  </section>
</template>
