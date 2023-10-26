import type { Tuple } from './types';

export type RGB = Tuple<number, 3>;
export type HSL = Tuple<number, 3>;
export type XYZ = Tuple<number, 3>;
export type LAB = Tuple<number, 3>;

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

/**
 * @description я ебал в рот это все еще раз расписывать, читай тут
 * {@link https://en.wikipedia.org/wiki/SRGB }
 *  */

export function rgbChannelToSRGB(channelValue: number) {
  const RATIO = channelValue / 255;
  const EX = 0.04045;
  const PHI = 12.92;
  const ALPHA = 0.055;
  const GAMMA = 2.4;

  return RATIO < EX ? RATIO / PHI : ((RATIO + ALPHA) / (1 + ALPHA)) ** GAMMA;
}

export function srgbChannelToRGB(channelValue: number) {
  const LINEAR_INTENSITY = 0.0031308;
  const GAMMA = 2.4;
  const ALPHA = 0.055;
  const PHI = 12.92;

  return (channelValue > LINEAR_INTENSITY ? (1 + ALPHA) * (channelValue ** (1 / GAMMA)) - ALPHA : PHI * channelValue) * 255;
}

/**
 * @description Вычисляем светлоту цвета по формуле
 *
 * @description Y = 0.2126R + 0.7152G + 0.0722B.
 *
 * {@link https://en.wikipedia.org/wiki/Relative_luminance }
 *  */
export function getLuminance(rgb: RGB): number {
  const sRGB = [
    rgbChannelToSRGB(rgb[0]),
    rgbChannelToSRGB(rgb[1]),
    rgbChannelToSRGB(rgb[2]),
  ];

  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

/**
 * @description Вычисляем яркости цвета по формуле Y = (299 R + 587 G + 114 B) / 1000 и нормализуем
 *  */
export function getBrightness(rgb: RGB): number {
  return (299 * rgb[0] + 587 * rgb[1] + 114 * rgb[2]) / 1000 / 255;
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
 * @description Формула относительной светлоты.
 * @description Y = 0.2126R + 0.7152G + 0.0722B.
 * {@link https://en.wikipedia.org/wiki/Relative_luminance }
 *
 * @description Значение 0.5 соответствует середине диапазона светлоты от 0 до 1, где 0 - это абсолютный черный цвет, а 1 - абсолютный белый цвет. Таким образом, если светлота заданного цвета больше 0.5, то он более светлый, и для контраста с ним следует использовать черный цвет текста.
 * */
export function getContrastTextColor(bgColor: RGB) {
  const luminance = getLuminance(bgColor);

  const LUMINANCE_BREAKPOINT = 0.5;

  return luminance > LUMINANCE_BREAKPOINT ? '#000000' : '#FFFFFF';
}

export function generateRandomRgb(): RGB {
  return Array
    .from({ length: 3 })
    .map(() => (Math.floor(Math.random() * (255 + 1)))) as RGB;
}

export function xyzToD50(xyz: XYZ): XYZ {
  const [x, y, z] = xyz;
  return [
    x * 1.0478112 + y * 0.0228866 + z * -0.050127,
    x * 0.0295424 + y * 0.9904844 + z * -0.0170491,
    x * -0.0092345 + y * 0.0150436 + z * 0.7521316,
  ];
}

/**
 * {@description} матрицы тут
 *
 * {@link http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html}
 * */
export function rgbToXyz(rgb: RGB): XYZ {
  const sRed = rgbChannelToSRGB(rgb[0]);
  const sGreen = rgbChannelToSRGB(rgb[1]);
  const sBlue = rgbChannelToSRGB(rgb[2]);

  return xyzToD50([
    (sRed * 0.4124564 + sGreen * 0.3575761 + sBlue * 0.1804375) * 100,
    (sRed * 0.2126729 + sGreen * 0.7151522 + sBlue * 0.072175) * 100,
    (sRed * 0.0193339 + sGreen * 0.119192 + sBlue * 0.9503041) * 100,
  ]);
}

/**
 * {@link http://www.brucelindbloom.com/index.html?Eqn_XYZ_to_Lab.html}
 *
 * {@link http://www.brucelindbloom.com/index.html?Eqn_ChromAdapt.html}
 *  */
export function xyzToLab(xyz: XYZ): LAB {
  const [_x, _y, _z] = xyz;

  const e = 216 / 24389;
  const k = 24389 / 27;

  /* D50 */
  let x = _x / 96.422;
  let y = _y / 100;
  let z = _z / 82.521;

  x = x > e ? Math.cbrt(x) : (k * x + 16) / 116;
  y = y > e ? Math.cbrt(y) : (k * y + 16) / 116;
  z = z > e ? Math.cbrt(z) : (k * z + 16) / 116;

  return [
    116 * y - 16,
    500 * (x - y),
    200 * (y - z),
  ];
}

/**
 * {@link https://zschuessler.github.io/DeltaE/learn/#toc-delta-e-2000}
 *
 * {@link https://en.wikipedia.org/wiki/Color_difference#CIEDE2000}
 *  */

export function getDeltaE00(color1: LAB, color2: LAB) {
  const [l1, a1, b1] = color1;
  const [l2, a2, b2] = color2;

  const rad2deg = 180 / Math.PI;
  const deg2rad = Math.PI / 180;

  const c1 = (a1 ** 2 + b1 ** 2) ** 0.5;
  const c2 = (a2 ** 2 + b2 ** 2) ** 0.5;
  const mc = (c1 + c2) / 2;
  const ml = (l1 + l2) / 2;

  // reuse
  const c7 = mc ** 7;
  const g = 0.5 * (1 - (c7 / (c7 + 25 ** 7)) ** 0.5);

  const a11 = a1 * (1 + g);
  const a22 = a2 * (1 + g);

  const c11 = (a11 ** 2 + b1 ** 2) ** 0.5;
  const c22 = (a22 ** 2 + b2 ** 2) ** 0.5;
  const mc1 = (c11 + c22) / 2;

  let h1 = a11 === 0 && b1 === 0 ? 0 : Math.atan2(b1, a11) * rad2deg;
  let h2 = a22 === 0 && b2 === 0 ? 0 : Math.atan2(b2, a22) * rad2deg;

  if (h1 < 0) h1 += 360;
  if (h2 < 0) h2 += 360;

  let dh = h2 - h1;
  const dhAbs = Math.abs(h2 - h1);

  if (dhAbs > 180 && h2 <= h1) {
    dh += 360;
  } else if (dhAbs > 180 && h2 > h1) {
    dh -= 360;
  }

  let H = h1 + h2;

  if (dhAbs <= 180) {
    H /= 2;
  } else {
    H = (h1 + h2 < 360 ? H + 360 : H - 360) / 2;
  }

  const T
    = 1
    - 0.17 * Math.cos(deg2rad * (H - 30))
    + 0.24 * Math.cos(deg2rad * 2 * H)
    + 0.32 * Math.cos(deg2rad * (3 * H + 6))
    - 0.2 * Math.cos(deg2rad * (4 * H - 63));

  const dL = l2 - l1;
  const dC = c22 - c11;
  const dH = 2 * Math.sin((deg2rad * dh) / 2) * (c11 * c22) ** 0.5;

  const sL = 1 + (0.015 * (ml - 50) ** 2) / (20 + (ml - 50) ** 2) ** 0.5;
  const sC = 1 + 0.045 * mc1;
  const sH = 1 + 0.015 * mc1 * T;

  const dTheta = 30 * Math.exp(-1 * ((H - 275) / 25) ** 2);
  const Rc = 2 * (c7 / (c7 + 25 ** 7)) ** 0.5;
  const Rt = -Rc * Math.sin(deg2rad * 2 * dTheta);

  return (
    ((dL / sL) ** 2
      + (dC / sC) ** 2
      + (dH / sH) ** 2
      + (Rt * dC * dH) / (sC * sH))
    ** 0.5
  );
}
