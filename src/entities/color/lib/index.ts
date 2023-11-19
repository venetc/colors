import ColorThief from 'colorthief';

import type { HSL, RGB } from '@/shared/lib/color';

import { getLuminance, hslToCss, rgbToHSL, rgbToHex } from '@/shared/lib/color';

const colorScrapper = new ColorThief();

type GetPalette = (args: { img: HTMLImageElement; colorCount?: number; quality?: number }) => RGB[];

export type ColorHex = Brand<Hex, 'ColorHex'>;

export interface Color {
  hex: ColorHex;
  rgb: string;
  rgbArray: RGB;
  hsl: string;
  hslArray: HSL;
  luminance: number;
}

export const getPalette: GetPalette = (args) => {
  const { img, colorCount = 6, quality = 3 } = args;
  return colorScrapper.getPalette(img, colorCount, quality);
};

export function generateColorData(payload: RGB): Color {
  const rgbArray = payload.map(number => number > 255 ? 255 : number) as RGB;

  const rgb = `rgb(${rgbArray[0]}, ${rgbArray[1]}, ${rgbArray[2]})`;
  const hex = rgbToHex(rgbArray) as ColorHex;
  const hslArray = rgbToHSL(rgbArray);
  const hsl = hslToCss(hslArray);
  const luminance = getLuminance(rgbArray);

  return {
    hex,
    rgb,
    rgbArray,
    hsl,
    hslArray,
    luminance,
  };
}
