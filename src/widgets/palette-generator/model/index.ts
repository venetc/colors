import { defineStore } from 'pinia';
import { generateUUID } from '@/shared/lib/string';

export const usePaletteGeneratorStore = defineStore('PaletteGenerator', {
  state: (): State => ({
    images: new Map(),
  }),
  getters: {},
  actions: {
    generateImagesData(srcArray: string[]) {
      const map = new Map<string, Image>();

      srcArray.forEach((src) => {
        const uuid = generateUUID();

        map.set(uuid, { src, palette: [] });
      });

      this.$patch((store) => {
        store.images = map;
      });
    },
  },
});

interface State { images: Map<string, Image> }
export interface Image { src: string; palette: Color[] }
type Hex = string;
interface RGB { r: number; g: number; b: number }
interface Color { hex: Hex; rgb: RGB }
