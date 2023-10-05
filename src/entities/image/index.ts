import { defineAsyncComponent } from 'vue';

export const ImagePreview = defineAsyncComponent(() => (import('./ui/ImagePreview.vue')));

export * from './model';
