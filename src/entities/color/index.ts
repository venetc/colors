import { defineAsyncComponent } from 'vue';

export const ColorsEditor = defineAsyncComponent(() => (import('./ui/ColorsEditor.vue')));

export * from './model';
export * from './lib';
