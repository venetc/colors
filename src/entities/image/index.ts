import { defineAsyncComponent } from 'vue';

export const ImagePreview = defineAsyncComponent(() => (import('./ui/ImagePreview.vue')));
export const ImageCard = defineAsyncComponent(() => (import('./ui/ImageCard.vue')));

export * from './model';
