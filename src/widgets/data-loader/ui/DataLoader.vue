<script setup lang="ts">
import { NButton, NSpace, NTabPane, NTabs } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { markRaw, nextTick, onMounted, ref } from 'vue';
import { ClipboardList, FileImage, FileText, Search, Sparkles, XOctagon } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

import { ImagesDownloaderByImageFiles, useGetImageFromFile } from '@/features/get-image-from-file';
import {
  ImageLinksTextarea,
  ImagesDownloadModal,
  ImagesDownloaderByTxtFiles,
  useGetImageFromLinks,
} from '@/features/get-image-from-links';
import { useImages } from '@/entities/image';

const getImageFromFileModel = useGetImageFromFile();
const getImageFromLinksModel = useGetImageFromLinks();
const imagesModel = useImages();

const {
  images,
  cache,
  downloadOrigin,
} = storeToRefs(imagesModel);
const { textareaData } = storeToRefs(getImageFromLinksModel);

const { push } = useRouter();

function clearImages() {
  getImageFromFileModel.clearUploader();
  getImageFromFileModel.clearFileList();

  getImageFromLinksModel.clearUploader();
  getImageFromLinksModel.clearLinksList();

  images.value.clear();
}

function resetAll() {
  imagesModel.clearCache();
  clearImages();
  getImageFromLinksModel.resetInput();
}

const tabs = [
  {
    name: 'images',
    icon: markRaw(FileImage),
    content: markRaw(ImagesDownloaderByImageFiles),
    description: 'Upload images',
    style: {
      minHeight: '190px',
    },
  },
  {
    name: 'txt',
    icon: markRaw(FileText),
    content: markRaw(ImagesDownloaderByTxtFiles),
    description: 'Upload txt',
    style: {
      minHeight: '190px',
    },
  },
  {
    name: 'links',
    icon: markRaw(ClipboardList),
    content: markRaw(ImageLinksTextarea),
    description: 'Paste links',
    style: {
      minHeight: '190px',
      height: '190px',
    },
  },
] as const;

const activeTab = ref<'images' | 'txt' | 'links'>(downloadOrigin.value ?? tabs[0].name);

function saveDownloadOrigin(origin?: 'images' | 'txt' | 'links') {
  nextTick(() => {
    downloadOrigin.value = origin ?? activeTab.value;
  });
}

onMounted(saveDownloadOrigin);
</script>

<template>
  <div class="transition">
    <NTabs
      v-model:value="activeTab"
      type="segment"
      justifyContent="center"
      animated
      :tabsPadding="5"
      @updateValue="resetAll(); saveDownloadOrigin($event)"
    >
      <NTabPane
        v-for="tab in tabs"
        :key="tab.name"
        :name="tab.name"
        :disabled="images.size > 0"
        :style="tab.style"
      >
        <template #tab>
          <div class="flex justify-center items-center gap-x-[6px]">
            <Component
              :is="tab.icon"
              :size="16"
              :stroke-width="1.5"
            />
            <span class="font-mono">{{ tab.description }}</span>
          </div>
        </template>
        <template #default>
          <Component :is="tab.content" />
        </template>
      </NTabPane>
    </NTabs>

    <Transition
      mode="out-in"
      name="fade"
      appear
    >
      <NSpace
        v-if="activeTab === 'links' && textareaData.length && images.size < 1"
        justify="end"
        class="mt-3"
      >
        <NButton
          size="medium"
          type="error"
          class="!font-mono"
          @click="getImageFromLinksModel.resetInput"
        >
          <template #icon>
            <XOctagon :size="16" />
          </template>
          Delete links
        </NButton>
        <NButton
          size="medium"
          type="success"
          class="!font-mono"
          @click="getImageFromLinksModel.parseInputValue"
        >
          <template #icon>
            <Search :size="16" />
          </template>
          Read links
        </NButton>
      </NSpace>
    </Transition>

    <Transition
      mode="out-in"
      name="fade"
      appear
    >
      <NSpace
        v-if="images.size > 0"
        justify="end"
        class="mt-3"
      >
        <NButton
          size="medium"
          type="error"
          class="!font-mono"
          @click="clearImages"
        >
          <template #icon>
            <XOctagon :size="16" />
          </template>
          Delete images
        </NButton>
        <NButton
          size="medium"
          type="success"
          class="!font-mono"
          @click="push({ name: 'Colors' }); cache.clear()"
        >
          <template #icon>
            <Sparkles :size="16" />
          </template>
          Get colors
        </NButton>
      </NSpace>
    </Transition>

    <ImagesDownloadModal />
  </div>
</template>

<style>
.n-tabs-tab--disabled {
  opacity: 0.5;
}
</style>
