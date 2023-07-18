import ColorThief from 'colorthief';
import type { Tuple } from '@/shared/lib/types';

const colorScrapper = new ColorThief();

type GetPalette = (args: { img: HTMLImageElement; colorCount?: number; quality?: number }) => Tuple<number, 3>[];

export const getPalette: GetPalette = ({ img, colorCount, quality }) => {
  return colorScrapper.getPalette(img, colorCount, quality);
};
