import { defineAsyncComponent } from 'vue';

export const ImageCard = defineAsyncComponent(() => (import('./ui/ImageCard.vue')));

export * from './model';
export * from './lib';
