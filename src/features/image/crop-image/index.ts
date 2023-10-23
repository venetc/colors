import { defineAsyncComponent } from 'vue';

export const ImageCropper = defineAsyncComponent(() => (import('./ui/ImageCropper.vue')));

export * from './model';
export * from './lib';
