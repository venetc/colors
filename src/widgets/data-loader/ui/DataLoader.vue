<script setup lang="ts">
import {
  NButton,
  NImage,
  NImageGroup,
  NInput,
  NSpace,
  NTabPane,
  NTabs,
} from 'naive-ui';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { ClipboardList, FileImage, FileText, Search, Sparkles, X, XOctagon } from 'lucide-vue-next';
import { useElementSize } from '@vueuse/core';

import { useRouter } from 'vue-router';
import { FilesLoader, useFileLoaderStore } from '@/features/image/upload-image';
import { DownloadDialog, useImageDownloaderStore } from '@/features/image/download-image';
import { useImagesStore } from '@/entities/image';
import { formatStringToLinks } from '@/shared/lib/string';
import { NoValidLinksError, useNotificationManager } from '@/shared/ui/notification';

const fileLoaderStore = useFileLoaderStore();
const imageDownlaoderStore = useImageDownloaderStore();
const imagesStore = useImagesStore();

const { clearUploader, clearFileList } = fileLoaderStore;
const { filesList } = storeToRefs(fileLoaderStore);

const { clearBlobCache } = imagesStore;
const { images } = storeToRefs(imagesStore);

const { updateLinksList } = imageDownlaoderStore;

const { callNotification: popInvalidLinksNotification } = useNotificationManager({ type: 'error', title: 'No valid links found!', content: NoValidLinksError });

const { push } = useRouter();

const inputValue = ref('');

function parseInputValue() {
  const links = formatStringToLinks(inputValue.value);
  links.length > 0 ? updateLinksList(links) : popInvalidLinksNotification();
}

const imagesContainer = ref<HTMLElement>();
const { width: containerWidth } = useElementSize(imagesContainer);

function removeImage(token: string) {
  images.value.delete(token);
  filesList.value.delete(token);
}
const activeTab = ref('images');

function resetInput() {
  inputValue.value = '';
}

function clearImages() {
  clearUploader();
  clearFileList();
  images.value.clear();
}

function resetAll() {
  clearBlobCache();
  clearImages();
  resetInput();
}
</script>

<template>
  <section class="root grid grid-cols-12 gap-5">
    <div
      ref="imagesContainer"
      class="row-start-1 col-start-5 col-span-8 images-container"
    >
      <NImageGroup>
        <TransitionGroup name="images-list">
          <div
            v-for="[key, image] in images"
            :key="key"
            class="image aspect-square mb-2 mr-2 inline-block relative group rounded-md bg-slate-500 bg-opacity-10"
          >
            <NImage
              :src="image.src"
              objectFit="cover"
              :imgProps="{ style: { marginInline: 'auto', position: 'absolute', width: '100%', height: '100%' } }"
              class="aspect-square select-none"
            />
            <i
              class="absolute cursor-pointer right-0 top-0 p-0.5 bg-opacity-25 bg-neutral-950 text-white rounded-bl-md border-white border-l border-b opacity-0 group-hover:opacity-100 transition-opacity"
              @click="removeImage(key)"
            >
              <X
                :size="16"
                :stroke-width="1.5"
              />
            </i>
          </div>
        </TransitionGroup>
      </NImageGroup>
    </div>
    <div
      class=" transition flex flex-col flex-nowrap gap-6 row-start-1  col-span-4 col-start-5 loader-container"
      :class="{ '-translate-x-[calc(100%_+_1.25rem)]': images.size > 0 }"
    >
      <NTabs
        v-model:value="activeTab"
        type="segment"
        justifyContent="center"
        animated
        :tabsPadding="5"
        @updateValue="resetAll"
      >
        <NTabPane
          name="images"
          :disabled="images.size > 0"
        >
          <template #tab>
            <div class="flex justify-center items-center gap-x-[6px]">
              <FileImage
                :size="16"
                :stroke-width="1.5"
              />
              <span class="font-mono">Upload images</span>
            </div>
          </template>
          <template #default>
            <FilesLoader allowedFiles="image/png,image/jpeg">
              <div class="flex flex-col items-center gap-4 py-4">
                <FileImage
                  :size="32"
                  :stroke-width="1"
                />
                <div class="text-base font-mono max-w-xs">
                  Click or drag and drop images<br>to this area
                </div>
              </div>
            </FilesLoader>
          </template>
        </NTabPane>
        <NTabPane
          :disabled="images.size > 0"
          name="txt"
        >
          <template #tab>
            <div class="flex justify-center items-center gap-x-[6px]">
              <FileText
                :size="16"
                :stroke-width="1.5"
              />
              <span class="font-mono">Upload txt</span>
            </div>
          </template>
          <template #default>
            <FilesLoader
              allowedFiles=".txt"
              @onLinksParseSuccess="updateLinksList"
              @onLinksParseFail="popInvalidLinksNotification"
            >
              <div class="flex flex-col items-center gap-4 py-4">
                <FileText
                  :size="32"
                  :stroke-width="1"
                />
                <div class="text-base font-mono max-w-xs">
                  Click or drag and drop txt file<br>to this area
                </div>
              </div>
            </FilesLoader>
          </template>
        </NTabPane>
        <NTabPane
          :disabled="images.size > 0"
          name="links"
          :style="{ minHeight: '190px', height: '100%' }"
        >
          <template #tab>
            <div class="flex justify-center items-center gap-x-[6px]">
              <ClipboardList
                :size="16"
                :stroke-width="1.5"
              />
              <span class="font-mono">Paste links</span>
            </div>
          </template>
          <template #default>
            <NInput
              v-model:value="inputValue"
              type="textarea"
              :resizable="false"
              placeholder="Paste images URL"
            />
          </template>
        </NTabPane>
      </NTabs>

      <Transition
        mode="out-in"
        name="fade"
        appear
      >
        <NSpace
          v-if="activeTab === 'links' && inputValue.length && images.size < 1"
          justify="end"
        >
          <NButton
            size="medium"
            type="error"
            class="!font-mono"
            @click="resetInput"
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
            @click="parseInputValue"
          >
            <template #icon>
              <Search :size="16" />
            </template>
            Read links
          </NButton>
        </NSpace>

        <NSpace
          v-else-if="images.size > 0"
          justify="end"
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
            @click="push({ name: 'Colors' })"
          >
            <template #icon>
              <Sparkles :size="16" />
            </template>
            Get colors
          </NButton>
        </NSpace>
      </Transition>
    </div>

    <DownloadDialog />
  </section>
</template>

<style>
.n-input.n-input--textarea {
  min-height: 100%;
}

.n-tabs-tab--disabled {
  opacity: 0.5;
}

.images-container {
  --container-width: calc(v-bind(containerWidth) * 1px);
  font-size: 0;
}

.image {
  width: calc((var(--container-width) / 7) - 0.5rem);
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.images-list-enter-from,
.images-list-leave-to {
  opacity: 0;
  transform: scale(0);
}

.images-list-leave-active {
  position: absolute;
}
</style>
