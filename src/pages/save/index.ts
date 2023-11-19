import SaveColorsPage from './ui/SaveColorsPage.vue';

import { defineAsyncComponent } from 'vue';

export const SavePageHeader = defineAsyncComponent(() => (import('./ui/SavePageHeader.vue')));

export default SaveColorsPage;
