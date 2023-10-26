import { defineAsyncComponent } from 'vue';
import SaveColorsPage from './ui/SaveColorsPage.vue';

export const SavePageHeader = defineAsyncComponent(() => (import('./ui/SavePageHeader.vue')));

export default SaveColorsPage;
