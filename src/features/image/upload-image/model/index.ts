import { defineStore, storeToRefs } from 'pinia';
import type { NUpload, UploadFileInfo } from 'naive-ui';
import { ref } from 'vue';
import { createImageFromFile } from '../lib';
import { useImagesStore } from '@/entities/image';
import { formatStringToLinks, generateUUID } from '@/shared/lib/string';

export type FileList = Map<string, UploadFileInfo>;

export const useFileLoaderStore = defineStore('ImagesUploaderStore', () => {
  const cleanUploaderMethod = ref<InstanceType<typeof NUpload>['clear']>();
  const filesList = ref<FileList>(new Map());

  const updateImagesFileList = ({ fileList: inputFiles }: { fileList: UploadFileInfo[] }) => {
    const imagesStore = useImagesStore();
    const { images } = storeToRefs(imagesStore);

    const imagesInStore = new Set([...images.value.values()].map(image => image.origin === 'file' ? image.fileName : image.originalSrc));

    const upsertFileInMap = (file: UploadFileInfo) => {
      const fileName = file.name;

      const alreadyInList = imagesInStore.has(fileName);

      if (alreadyInList) return;

      const uuid = generateUUID();
      filesList.value.set(uuid, file);
    };

    inputFiles.forEach(upsertFileInMap);

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

    filesList.value.forEach((file, uuid) => {
      const blobSrc = blobCache.value.get(file.name);

      if (!blobSrc) return;

      const image = createImageFromFile({
        fileName: file.name,
        blobSrc,
      });

      imagesStore.addImageToList(uuid, image);
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
