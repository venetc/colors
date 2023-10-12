import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useHeaderStore = defineStore('AppHeaderStore', () => {
  const isHeaderActive = ref(true);

  return { isHeaderActive };
});
