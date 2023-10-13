import type { Tuple } from './types';

export type RGB = Tuple<number, 3>;
export type HSL = Tuple<number, 3>;

interface GenerateColorsBetweenParams {
  startColor: string;
  endColor: string;
  count: number;
}

export function generateColorsBetween(args: GenerateColorsBetweenParams): string[] {
  const {
    startColor,
    endColor,
    count,
  } = args;

  // Преобразуем hex-строки в RGB-значения
  const startRGB = hexToRGB(startColor);
  const endRGB = hexToRGB(endColor);

  // Генерируем массив цветов между начальным и конечным цветами
  const colors = [];
  for (let i = 0; i < count; i++) {
    const r = startRGB[0] + ((endRGB[0] - startRGB[0]) * i) / (count - 1);
    const g = startRGB[1] + ((endRGB[1] - startRGB[1]) * i) / (count - 1);
    const b = startRGB[2] + ((endRGB[2] - startRGB[2]) * i) / (count - 1);
    const color = rgbToHex([Math.round(r), Math.round(g), Math.round(b)]);
    colors.push(color);
  }

  return colors;
}

/** Преобразование hex-строки в RGB-значения */
export function hexToRGB(hex: string): RGB {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

/** Преобразование RGB-значений в hex-строку */
export function rgbToHex(rgb: RGB): string {
  const hexR = rgb[0].toString(16).padStart(2, '0');
  const hexG = rgb[1].toString(16).padStart(2, '0');
  const hexB = rgb[2].toString(16).padStart(2, '0');
  return `#${hexR}${hexG}${hexB}`.toUpperCase();
}

export function rgbToCss(rgb: RGB): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

export function hslToCss(hsl: HSL): string {
  return `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
}

export function rgbToHSL(rgb: RGB): HSL {
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h;
  let s;
  let l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        h = 0;
    }

    h /= 6;
  }

  h *= 360;
  s *= 100;
  l *= 100;

  return [h, s, l];
}

export function hslToRGB(hsl: HSL): RGB {
  const h = hsl[0] / 360;
  const s = hsl[1] / 100;
  const l = hsl[2] / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    function hue2rgb(p: number, q: number, t: number) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  r *= 255;
  g *= 255;
  b *= 255;

  return [r, g, b];
}

export function getBrightness(rgb: RGB): number {
  /**
   * Вычисляем яркость цвета по формуле Y = 0.2126 R + 0.7152 G + 0.0722 B
   *  */
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

export function shadeHexColor(color: string, decimal: number): string {
  return hexToRGB(color)
    .map(c => (Math.round(c / decimal)))
    .map(c => (c < 255 ? c : 255))
    .reduce((res, c) => {
      res += c.toString(16).padStart(2, '0');
      return res;
    }, '#');
}

/**
 * @description Формула относительной яркости.
 * @description Y = 0.2126R + 0.7152G + 0.0722B.
 * {@link https://en.wikipedia.org/wiki/Relative_luminance }
 * */
export function getContrastTextColor(bgColor: string) {
  // Преобразуем hex-строку в RGB-значения
  const rgb = hexToRGB(bgColor);

  const brightness = getBrightness(rgb);

  /**
   * Значение 128 соответствует середине диапазона яркости от 0 до 255, где 0 - это абсолютный черный цвет,
   * а 255 - абсолютный белый цвет. Таким образом, если яркость заданного цвета больше 128, то он более светлый,
   * и для контраста с ним следует использовать черный цвет текста.
   * */
  const BRIGHTNESS_BREAKPOINT = 170;

  return brightness > BRIGHTNESS_BREAKPOINT ? '#000000' : '#FFFFFF';
}

export function generateRandomRgb(): RGB {
  return Array
    .from({ length: 3 })
    .map(() => (Math.floor(Math.random() * (255 + 1)))) as RGB;
}
