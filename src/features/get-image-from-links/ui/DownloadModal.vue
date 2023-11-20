<script setup lang="ts">
import { useGetImageFromLinks } from '../model.ts';

import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import {
  NButton,
  NCard,
  NModal,
  NNumberAnimation,
  NProgress,
  NSpace,
  NStatistic,
  NTooltip,
  type NumberAnimationInst,
  useThemeVars,
} from 'naive-ui';
import { ExternalLink, Sparkles, Trash2 } from 'lucide-vue-next';

import { valueToPercent } from '@/shared/lib/number.ts';
import { ellipsisString } from '@/shared/lib/string.ts';

const getImageFromLinksModel = useGetImageFromLinks();
const {
  amountOfLinks,
  imagesFailedToFetch,
  loadedWithoutError,
  totalFetchedImages,
} = storeToRefs(getImageFromLinksModel);

const showModal = computed(() => amountOfLinks.value > 0 || imagesFailedToFetch.value.size > 0);

const totalImagesAnimationRef = ref<NumberAnimationInst | null>(null);
const playTotalLinksAnimation = () => totalImagesAnimationRef.value?.play();

const themeVars = useThemeVars();
const trackColor = computed(() => (imagesFailedToFetch.value.size > 0 ? themeVars.value.warningColor : themeVars.value.successColor));
const percentage = computed(() => (~~valueToPercent(totalFetchedImages.value, 0, amountOfLinks.value)));

function clearAndCloseModal() {
  imagesFailedToFetch.value.clear();
  getImageFromLinksModel.clearUploader();
  getImageFromLinksModel.clearLinksList();
  totalFetchedImages.value = 0;
}

function completeLinksUpload() {
  getImageFromLinksModel.updateImagesListFromLinks();
  clearAndCloseModal();
}

const {
  isLoading,
  loadImages,
} = getImageFromLinksModel.useImageDownloader({ onSuccess: completeLinksUpload });
</script>

<template>
  <NModal
    :show="showModal"
    :blockScroll="false"
    :closeOnEsc="false"
    :maskClosable="false"
    :onAfterEnter="playTotalLinksAnimation"
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
              :to="amountOfLinks"
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
          :showIndicator="false"
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
