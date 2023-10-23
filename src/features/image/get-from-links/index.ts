import { defineAsyncComponent } from 'vue';

export * from './lib.ts';
export * from './model.ts';

export const ImagesDownloaderByTxtFiles = defineAsyncComponent(() => (import('./ui/ImagesDownloaderByTxt.vue')));
export const ImageLinksTextarea = defineAsyncComponent(() => (import('./ui/ImageLinksTextarea.vue')));
export const ImagesDownloadModal = defineAsyncComponent(() => (import('./ui/DownloadModal.vue')));
