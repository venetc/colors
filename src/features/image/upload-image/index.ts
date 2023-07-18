import { defineAsyncComponent } from 'vue';

export const FilesLoader = defineAsyncComponent(() => (import('./ui/FilesLoader.vue')));

export * from './lib';
export * from './model';
