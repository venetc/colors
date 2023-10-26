import { defineAsyncComponent } from 'vue';

export * from './lib.ts';
export * from './model.ts';
export const ImagesDownloaderByImageFiles = defineAsyncComponent(() => (import('./ui.vue')));
