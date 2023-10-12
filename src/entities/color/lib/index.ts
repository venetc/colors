import ColorThief from 'colorthief';
import { getBrightness, hslToCss, rgbToHSL, rgbToHex } from '@/shared/lib/color';
import type { HSL, RGB } from '@/shared/lib/color';

const colorScrapper = new ColorThief();

type GetPalette = (args: { img: HTMLImageElement; colorCount?: number; quality?: number }) => RGB[];

export interface Color {
  hex: string;
  rgb: string;
  rgbArray: RGB;
  hsl: string;
  hslArray: HSL;
  brightness: number;
}

export const getPalette: GetPalette = ({
  img,
  colorCount = 6,
  quality = 2,
}) => {
  return colorScrapper.getPalette(img, colorCount, quality);
};

export function generateColorData(payload: RGB): Color {
  const rgbArray = payload.map(number => number > 255 ? 255 : number) as RGB;

  const rgb = `rgb(${rgbArray[0]}, ${rgbArray[1]}, ${rgbArray[2]})`;
  const hex = rgbToHex(rgbArray);
  const hslArray = rgbToHSL(rgbArray);
  const hsl = hslToCss(hslArray);
  const brightness = getBrightness(rgbArray);

  return {
    hex,
    rgb,
    rgbArray,
    hsl,
    hslArray,
    brightness,
  };
}
