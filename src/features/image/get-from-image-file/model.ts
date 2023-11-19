import { createImageFromFile } from './lib.ts';

import { defineStore, storeToRefs } from 'pinia';
import { ref } from 'vue';

import type { NUpload, UploadFileInfo } from 'naive-ui';
import type { Ref } from 'vue';

import { useImages } from '@/entities/image';

export type FileList = Map<string, UploadFileInfo>;

export const useGetImageFromFile = defineStore('Features/Image/GetFromImageFile', () => {
  const cleanUploaderMethod = ref<InstanceType<typeof NUpload>['clear'] | undefined>();
  const filesList = ref<FileList>(new Map());

  const updateImagesFileList = ({ fileList: inputFiles }: { fileList: UploadFileInfo[] }) => {
    const imagesModel = useImages();
    const { images } = storeToRefs(imagesModel);

    const imagesInStore = new Set([...images.value.values()].map(image => image.origin === 'file' ? image.fileName : image.originalSrc));

    const upsertFileInMap = (file: UploadFileInfo) => {
      const fileName = file.name;

      const alreadyInList = imagesInStore.has(fileName);

      if (alreadyInList) return;

      filesList.value.set(file.id, file);
    };

    inputFiles.forEach(upsertFileInMap);

    filesList.value.forEach(({ file }) => {
      imagesModel.addBlobToCache(file);
    });
  };
  const clearFileList = () => {
    filesList.value.clear();
  };
  const updateImagesListFromFiles = () => {
    const imagesModel = useImages();
    const { cache } = storeToRefs(imagesModel);

    filesList.value.forEach((file) => {
      const blobSrc = cache.value.get(file.name);

      if (!blobSrc) return;

      const image = createImageFromFile({
        fileName: file.name,
        blobSrc,
      });

      imagesModel.addImageToList(image.id, image);
    });
  };

  const clearUploader = () => {
    if (cleanUploaderMethod.value) cleanUploaderMethod.value();
  };
  const setCleanMethod = (uploader: Ref<InstanceType<typeof NUpload> | undefined>) => {
    cleanUploaderMethod.value = uploader.value?.clear;
  };

  const removeFileFromList = (id: string) => {
    filesList.value.delete(id);
    clearUploader();
  };

  return {
    cleanUploaderMethod,
    filesList,
    updateImagesFileList,
    clearFileList,
    updateImagesListFromFiles,
    clearUploader,
    setCleanMethod,
    removeFileFromList,
  };
});
