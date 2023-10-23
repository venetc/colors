import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useHeaderStore = defineStore('Widgets/AppHeader', () => {
  const isHeaderActive = ref(true);

  return { isHeaderActive };
});
