import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePaletteGeneratorStore = defineStore('PaletteGenerator', () => {
  const hello = ref('????');

  return { hello };
});

export interface Image { src: string; palette: Color[] }
type Hex = string;
interface RGB { r: number; g: number; b: number }
interface Color { hex: Hex; rgb: RGB }
