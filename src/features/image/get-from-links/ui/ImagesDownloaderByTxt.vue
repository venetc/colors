<script setup lang="ts">
import { FileText } from 'lucide-vue-next';
import type { UploadFileInfo } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { useGetImageFromLinks } from '../model';
import { NoValidLinksError, useNotificationManager } from '@/shared/ui/notification';
import { useImagesStore } from '@/entities/image';
import { DropUploader } from '@/shared/ui/drop-uploader';

defineOptions({
  name: 'ImagesDownloaderByTxt',
});

const getImageFromLinksModel = useGetImageFromLinks();
const imagesStore = useImagesStore();

const { images } = storeToRefs(imagesStore);

const { callNotification: popInvalidLinksNotification } = useNotificationManager({
  type: 'error',
  title: 'No valid links found!',
  content: NoValidLinksError,
});

async function uploaderChangeHandler(fileList: UploadFileInfo[]) {
  const [{ file }] = fileList;
  const links = await getImageFromLinksModel.getLinksFromFile(file);

  if (links.length > 0) {
    getImageFromLinksModel.updateLinksList(links);
  } else {
    popInvalidLinksNotification();
  }
}
</script>

<template>
  <DropUploader
    :multiple="false"
    :directoryDnd="false"
    :disabled="images.size > 0"
    allowedFiles=".txt"
    @onChange="uploaderChangeHandler"
    @onInit="getImageFromLinksModel.setCleanMethod"
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
  </DropUploader>
</template>
