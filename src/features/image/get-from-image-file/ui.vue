<script setup lang="ts">
import { useGetImageFromFile } from './model';

import { FileImage } from 'lucide-vue-next';

import type { UploadFileInfo } from 'naive-ui';

import { DropUploader } from '@/shared/ui/drop-uploader';

defineOptions({
  name: 'ImagesDownloaderByFiles',
});

const getImageFromFileModel = useGetImageFromFile();

function uploaderChangeHandler(fileList: UploadFileInfo[]) {
  getImageFromFileModel.updateImagesFileList({ fileList });
  getImageFromFileModel.updateImagesListFromFiles();
  getImageFromFileModel.clearFileList();
}
</script>

<template>
  <DropUploader
    :multiple="true"
    :directoryDnd="true"
    :disabled="false"
    allowedFiles="image/png,image/jpeg"
    @onChange="uploaderChangeHandler"
    @onInit="getImageFromFileModel.setCleanMethod"
  >
    <div class="flex flex-col items-center gap-4 py-4">
      <FileImage
        :size="32"
        :stroke-width="1"
      />
      <div class="text-base font-mono max-w-xs">
        Click or drag and drop images<br>to this area
      </div>
    </div>
  </DropUploader>
</template>
