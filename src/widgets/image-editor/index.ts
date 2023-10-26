import { defineAsyncComponent } from 'vue';

export const ImageEditor = defineAsyncComponent(() => (import('./ui/ImageEditor.vue')));

export * from './model';
