import ColorThief from 'colorthief';
import { rgbToHex } from '@/shared/lib/color';
import type { RGB } from '@/shared/lib/color';

const colorScrapper = new ColorThief();

type GetPalette = (args: { img: HTMLImageElement; colorCount?: number; quality?: number }) => RGB[];

export interface Color {
  hex: string;
  rgb: string;
  rawRGB: RGB;
}

export const getPalette: GetPalette = ({
  img,
  colorCount = 5,
  quality = 2,
}) => {
  return colorScrapper.getPalette(img, colorCount, quality);
};

export function generateColorObject(rawRGB: RGB): Color {
  const rgb = `rgb(${rawRGB[0]}, ${rawRGB[1]}, ${rawRGB[2]})`;
  const hex = rgbToHex(rawRGB);

  return {
    hex,
    rgb,
    rawRGB,
  };
}
