import { defineAsyncComponent } from 'vue';

export const AppRoot = defineAsyncComponent(() => (import('./AppRoot.vue')));
