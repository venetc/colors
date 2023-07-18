<script setup lang="ts">
import type { UploadFileInfo } from 'naive-ui';
import { NUpload, NUploadDragger } from 'naive-ui';
import { useDebounceFn } from '@vueuse/core';
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useFileLoaderStore } from '../model';

type ImageType = typeof IMAGE_FILES;
type TextType = typeof TEXT_FILES;
type FileType = ImageType | TextType;

export interface Props { allowedFiles: FileType }

const { allowedFiles } = defineProps<Props>();

const emit = defineEmits<{
  onLinksParseSuccess: [links: string[]]
  onLinksParseFail: []
}>();
const TEXT_FILES = '.txt' as const;
const IMAGE_FILES = 'image/png,image/jpeg' as const;

const fileLoaderStore = useFileLoaderStore();

const { updateImagesFileList, clearUploader, updateImagesListFromFiles, getLinksFromFile } = fileLoaderStore;
const { cleanUploaderMethod } = storeToRefs(fileLoaderStore);

async function composeUpdateFileList({ fileList }: { fileList: UploadFileInfo[] }) {
  if (allowedFiles === IMAGE_FILES) {
    updateImagesFileList({ fileList });
    updateImagesListFromFiles();
  } else {
    const [{ file }] = fileList;
    const links = await getLinksFromFile(file);

    if (links.length > 0) {
      emit('onLinksParseSuccess', links);
    } else {
      // popInvalidLinksNotification();
      emit('onLinksParseFail');
    }
  }
  clearUploader();
}

const debouncedUpdateFileList = useDebounceFn(composeUpdateFileList, 200);

const uploader = ref<InstanceType<typeof NUpload>>();

onMounted(() => {
  cleanUploaderMethod.value = uploader.value?.clear;
});
</script>

<template>
  <NUpload
    ref="uploader"
    :multiple="allowedFiles === IMAGE_FILES"
    :directoryDnd="allowedFiles === IMAGE_FILES"
    :accept="allowedFiles"
    :defaultUpload="false"
    :showFileList="false"
    @change="debouncedUpdateFileList"
  >
    <NUploadDragger>
      <slot />
    </NUploadDragger>
  </NUpload>
</template>
