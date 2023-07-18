import { defineStore } from 'pinia';
import { formatStringToLinks } from '@/shared/lib/string';

interface State {
  inputValue: string
  linksArray: string[]
}

export const useDataLoaderStore = defineStore('DataLoader', {
  state: (): State => ({
    inputValue: '',
    linksArray: [],
  }),
  getters: {
    parsedImagesCount: state => (state.linksArray.length),
  },
  actions: {
    splitStringToLinks() {
      const links = formatStringToLinks(this.inputValue);

      this.$patch((state) => {
        state.linksArray = links;
      });
    },
  },
});
