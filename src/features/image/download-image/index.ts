import { defineAsyncComponent } from 'vue';

export const DownloadDialog = defineAsyncComponent(() => (import('./ui/DownloadDialog.vue')));

export * from './lib';
export * from './model';
