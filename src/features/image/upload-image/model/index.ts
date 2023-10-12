import { defineStore, storeToRefs } from 'pinia';
import type { NUpload, UploadFileInfo } from 'naive-ui';
import { ref } from 'vue';
import { createImageFromFile } from '../lib';
import { useImagesStore } from '@/entities/image';
import { formatStringToLinks } from '@/shared/lib/string';

export type FileList = Map<string, UploadFileInfo>;

export const useFileLoaderStore = defineStore('ImagesUploaderStore', () => {
  const cleanUploaderMethod = ref<InstanceType<typeof NUpload>['clear']>();
  const filesList = ref<FileList>(new Map());

  const updateImagesFileList = ({ fileList: inputFiles }: { fileList: UploadFileInfo[] }) => {
    const upsertFileInMap = (file: UploadFileInfo) => {
      filesList.value.set(file.name, file);
    };

    inputFiles.forEach(upsertFileInMap);

    const imagesStore = useImagesStore();

    filesList.value.forEach(({ file }) => {
      imagesStore.addBlobToCache(file);
    });
  };

  const clearFileList = () => {
    filesList.value.clear();
  };
  const updateImagesListFromFiles = () => {
    const imagesStore = useImagesStore();
    const { blobCache } = storeToRefs(imagesStore);

    filesList.value.forEach((file) => {
      const fileName = file.name;
      const blobSrc = blobCache.value.get(fileName);

      if (!blobSrc) return;

      const image = createImageFromFile({
        fileName,
        blobSrc,
      });
      imagesStore.addImageToList(fileName, image);
    });
  };
  const clearUploader = () => {
    if (cleanUploaderMethod.value) cleanUploaderMethod.value();
  };
  const getLinksFromFile = async (file: File | null | undefined): Promise<string[]> => {
    if (!file) return [];
    try {
      const text = await file.text();
      return formatStringToLinks(text);
    } catch (exception) {
      console.warn(exception);
      return [];
    }
  };

  return {
    filesList,
    updateImagesFileList,
    clearFileList,
    updateImagesListFromFiles,
    cleanUploaderMethod,
    clearUploader,
    getLinksFromFile,
  };
});
