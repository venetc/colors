<script setup lang="ts">
import type { NumberAnimationInst, UploadFileInfo } from 'naive-ui';
import { NButton, NCard, NModal, NNumberAnimation, NProgress, NSpace, NStatistic, NTooltip, NUpload, NUploadDragger, useThemeVars } from 'naive-ui';
import { useDebounceFn } from '@vueuse/core';
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { ExternalLink, Sparkles, Trash2 } from 'lucide-vue-next';
import { useFileLoaderStore } from '../model';
import NoValidLinksError from './NoValidLinksError.vue';
import { useNotificationManager } from '@/shared/ui/notification';
import { valueToPercent } from '@/shared/lib/number';
import { ellipsisString } from '@/shared/lib/string';

type ImageType = typeof IMAGE_FILES;
type TextType = typeof TEXT_FILES;
type FileType = ImageType | TextType;

export interface Props { allowedFiles: FileType }

const { allowedFiles } = defineProps<Props>();

const TEXT_FILES = '.txt' as const;
const IMAGE_FILES = 'image/png,image/jpeg' as const;

const fileLoaderStore = useFileLoaderStore();

const { updateImagesFileList, clearUploader, updateImagesListFromFiles, updateLinksList, clearLinksList, updateImagesListFromLinks, getLinksFromFile, useImageDownloader } = fileLoaderStore;
const { cleanUploaderMethod, imagesFailedToFetch, amountOflinks, totalFetchedImages, loadedWithoutError } = storeToRefs(fileLoaderStore);
const { callNotification: popInvalidLinksNotification } = useNotificationManager({ type: 'error', title: 'No valid links found!', content: NoValidLinksError });

const showModal = computed(() => amountOflinks.value > 0 || imagesFailedToFetch.value.size > 0);
const totalImagesAnimationRef = ref<NumberAnimationInst | null>(null);

async function composeUpdateFileList({ fileList }: { fileList: UploadFileInfo[] }) {
  if (allowedFiles === IMAGE_FILES) {
    updateImagesFileList({ fileList });
    updateImagesListFromFiles();
  } else {
    const [{ file }] = fileList;
    const links = await getLinksFromFile(file);

    if (links.length > 0) {
      updateLinksList(links);
    } else {
      popInvalidLinksNotification();
    }
  }
  clearUploader();
}

const debouncedUpdateFileList = useDebounceFn(composeUpdateFileList, 200);

const uploader = ref<InstanceType<typeof NUpload>>();

const playTotalLinksAnimation = () => totalImagesAnimationRef.value?.play();

const themeVars = useThemeVars();
const trackColor = computed(() => (imagesFailedToFetch.value.size > 0 ? themeVars.value.warningColor : themeVars.value.successColor));
const percentage = computed(() => (~~valueToPercent(totalFetchedImages.value, 0, amountOflinks.value)));

function clearAndCloseModal() {
  imagesFailedToFetch.value.clear();
  clearLinksList();
  totalFetchedImages.value = 0;
}

function completeLinksUpload() {
  updateImagesListFromLinks();
  clearAndCloseModal();
}

const { isLoading, loadImages } = useImageDownloader({ onSuccess: completeLinksUpload });

onMounted(() => {
  cleanUploaderMethod.value = uploader.value?.clear;
});
</script>

<template>
  <NUpload
    ref="uploader"
    :multiple="allowedFiles === IMAGE_FILES"
    :directory-dnd="allowedFiles === IMAGE_FILES"
    :accept="allowedFiles"
    :default-upload="false"
    :show-file-list="false"
    @change="debouncedUpdateFileList"
  >
    <NUploadDragger>
      <slot />
    </NUploadDragger>
  </NUpload>

  <NModal
    :show="showModal"
    :block-scroll="false"
    :close-on-esc="false"
    :mask-closable="false"
    :on-after-enter="playTotalLinksAnimation"
  >
    <NCard
      style="width: 600px"
      title="Loading Images"
      :bordered="false"
      size="large"
      role="dialog"
      aria-modal="true"
      class="!font-mono"
    >
      <template #header-extra>
        <NStatistic :style="{ '--n-value-font-size': '1.125rem' }">
          <template #prefix>
            {{ loadedWithoutError }}
          </template>
          <template #suffix>
            /
            <NNumberAnimation
              ref="totalImagesAnimationRef"
              :from="0"
              :to="amountOflinks"
              :active="false"
              :duration="1500"
              @finish="loadImages"
            />
          </template>
        </NStatistic>
      </template>

      <Transition
        mode="out-in"
        name="fade-slower"
        appear
      >
        <NProgress
          v-if="isLoading"
          type="line"
          :show-indicator="false"
          :percentage="percentage"
          status="default"
          :color="trackColor"
          processing
        />
        <div v-else-if="!isLoading && imagesFailedToFetch.size > 0">
          <NTooltip
            placement="left"
            trigger="hover"
          >
            <template #trigger>
              <span class="text-blue-500 underline cursor-pointer underline-offset-2 inline-block">
                Some images
              </span>
            </template>
            <div>
              <a
                v-for="link in imagesFailedToFetch"
                :key="link"
                :href="link"
                target="_blank"
                class="flex flex-nowrap items-center justify-center text-xs my-1"
              >
                <span>{{ ellipsisString(link) }}</span>
                <ExternalLink
                  :size="12"
                  class="ml-2"
                />
              </a>
            </div>
          </NTooltip>
          <span class="ml-1.5">failed to load. Try to upload them manually,
            <br>
            or reupload to
            <a
              class="text-blue-500 underline cursor-pointer underline-offset-2 inline-block"
              href="https://imgur.com/"
              target="_blank"
              rel="noopener noreferrer"
            >Imgur</a>
            or
            <a
              class="text-blue-500 underline cursor-pointer underline-offset-2 inline-block"
              href="https://postimages.org/"
              target="_blank"
              rel="noopener noreferrer"
            >PostImage</a>
          </span>

          <NSpace
            align="center"
            justify="end"
            class="pt-6"
          >
            <NButton
              size="small"
              type="error"
              class="!font-mono"
              @click="clearAndCloseModal"
            >
              <template #icon>
                <Trash2 :size="14" />
              </template>
              Clear and close
            </NButton>
            <NButton
              v-if="loadedWithoutError > 0"
              size="small"
              type="success"
              class="!font-mono"
              @click="completeLinksUpload"
            >
              <template #icon>
                <Sparkles :size="14" />
              </template>
              Show images
            </NButton>
          </NSpace>
        </div>
      </Transition>
    </NCard>
  </NModal>
</template>
