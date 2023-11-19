import ColorsPage from './ui/ColorsPage.vue';

import { defineAsyncComponent } from 'vue';

export const ColorsPageHeader = defineAsyncComponent(() => (import('./ui/ColorsPageHeader.vue')));
export default ColorsPage;
