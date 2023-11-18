import { defineAsyncComponent } from 'vue';

export const ColorsList = defineAsyncComponent(() => (import('./ui/ColorsList.vue')));

export * from './model';
export * from './lib';
