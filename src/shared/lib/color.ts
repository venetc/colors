import type { Tuple } from './types';

type RGB = Tuple<number, 3>;

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
  return `#${hexR}${hexG}${hexB}`;
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
  const [r, g, b] = hexToRGB(bgColor);

  // Вычисляем яркость цвета по формуле Y = 0.2126 R + 0.7152 G + 0.0722 B
  const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  /**
   * Значение 128 соответствует середине диапазона яркости от 0 до 255, где 0 - это абсолютный черный цвет,
   * а 255 - абсолютный белый цвет. Таким образом, если яркость заданного цвета больше 128, то он более светлый,
   * и для контраста с ним следует использовать черный цвет текста.
   * */
  const BRIGHTNESS_BREAKPOINT = 170;

  return brightness > BRIGHTNESS_BREAKPOINT ? '#000000' : '#FFFFFF';
}
