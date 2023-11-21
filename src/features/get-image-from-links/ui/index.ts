import { defineAsyncComponent } from 'vue';

export const ImagesDownloaderByTxtFiles = defineAsyncComponent(() => (import('./ImagesDownloaderByTxt.vue')));
export const ImageLinksTextarea = defineAsyncComponent(() => (import('./ImageLinksTextarea.vue')));
export const ImagesDownloadModal = defineAsyncComponent(() => (import('./DownloadModal.vue')));
export const NoValidLinksError = defineAsyncComponent(() => (import('./NoValidLinksError.vue')));
