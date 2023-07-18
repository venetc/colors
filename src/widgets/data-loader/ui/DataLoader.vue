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

import { ref /* watch */ } from 'vue';
import { ClipboardList, FileImage, FileText, X, XOctagon } from 'lucide-vue-next';

import { useDebounceFn, useElementSize /* useFileSystemAccess */ } from '@vueuse/core';

import { /* useRouter */ } from 'vue-router';
import { useDataLoaderStore } from '../model';
import { FilesLoader, useFileLoaderStore } from '@/features/image/upload-image';
import { useImagesStore } from '@/entities/image';

const dataLoaderStore = useDataLoaderStore();
const fileLoaderStore = useFileLoaderStore();

const imagesStore = useImagesStore();

const { splitStringToLinks } = dataLoaderStore;
const { inputValue } = storeToRefs(dataLoaderStore);

const { clearUploader, clearBlobCache, clearFileList } = fileLoaderStore;
const { filesList } = storeToRefs(fileLoaderStore);

const { images } = storeToRefs(imagesStore);

const debouncedSplit = useDebounceFn(splitStringToLinks, 100, { maxWait: 1000 });

// const imagesListVisible = ref(false);

/* const { isSupported, data, open } = useFileSystemAccess({
  dataType: 'Text',
  types: [
    { accept: { 'text/plain': ['.txt'] }, }
  ],
  excludeAcceptAllOption: true
});

watch(data, (value) => {
  if (!value) return;

  dataLoaderStore.$patch((store) => {
    store.inputValue = value;
  });

  data.value = undefined;
  debouncedSplit();
}); */

// const { push } = useRouter();

const imagesContainer = ref<HTMLElement>();
const { width: containerWidth } = useElementSize(imagesContainer);

function removeImage(token: string) {
  images.value.delete(token);
  filesList.value.delete(token);
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
              object-fit="cover"
              :img-props="{ style: { marginInline: 'auto', position: 'absolute', width: '100%', height: '100%' } }"
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
        type="segment"
        justify-content="center"
        animated
        :tabs-padding="5"
        @update-value="clearBlobCache(); clearUploader(); clearFileList()"
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
            <FilesLoader allowed-files="image/png,image/jpeg">
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
            <FilesLoader allowed-files=".txt">
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
              size="large"
              placeholder="Paste images URL"
              :on-input="debouncedSplit"
            />
          </template>
        </NTabPane>
      </NTabs>
      <NSpace justify="center">
        <NButton
          size="medium"
          type="warning"
          class="!font-mono"
        >
          <template #icon>
            <XOctagon />
          </template>
          Warning
        </NButton>
        <NButton
          size="medium"
          type="error"
          class="!font-mono"
          @click="images.clear(); clearUploader(); clearFileList()"
        >
          <template #icon>
            <XOctagon />
          </template>
          Clear data
        </NButton>
      </NSpace>
    </div>
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
