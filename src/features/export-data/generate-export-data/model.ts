import type { MaybeRef, Ref } from 'vue';
import { computed, ref, toValue } from 'vue';
import type { Color, ColorCollection, ImageColor } from '@/entities/color';
import type { ImageId, Img } from '@/entities/image';
import { isEmptyObject } from '@/shared/lib/assertions';
import type { CamelToSnakeCase } from '@/shared/lib/string';
import { camelToSnake } from '@/shared/lib/string';

export type SyntaxConfigOptions = 'snakeCase';
export type ColorDataConfig = Record<keyof Color, {
  isIncluded: boolean;
  label: string;
}>;
export type SyntaxConfig = Record<SyntaxConfigOptions, {
  isActive: boolean;
  label: string;
}>;
export type KeysToSnakeCase<T> = { [K in keyof T as CamelToSnakeCase<string & K>]: T[K] };
export type MaybeSnakeCase<T> = T | KeysToSnakeCase<T>;
export type PartialMaybeSnakeCase<T> = Partial<MaybeSnakeCase<T>>;

export interface ExportConfig {
  colorDataConfig: MaybeRef<ColorDataConfig>;
  syntaxConfig: MaybeRef<SyntaxConfig>;
}

export interface ExportImageData {
  image: string;
  colors: PartialMaybeSnakeCase<Color>[];
}

export interface ExportDataComposableArgs {
  images: Ref<Map<ImageId, Img>>;
  colors: Ref<Map<ImageId, ColorCollection>>;
  config: ExportConfig;
}

export function useExportConfig(): ExportConfig {
  const colorDataConfig = ref<ColorDataConfig>({
    hex: {
      isIncluded: true,
      label: 'Hex',
    },
    rgb: {
      isIncluded: true,
      label: 'RGB',
    },
    hsl: {
      isIncluded: true,
      label: 'HSL',
    },
    luminance: {
      isIncluded: true,
      label: 'Luminance',
    },
    rgbArray: {
      isIncluded: true,
      label: 'RGB Array',
    },
    hslArray: {
      isIncluded: true,
      label: 'HSL Array',
    },
  });
  const syntaxConfig = ref<SyntaxConfig>({
    snakeCase: {
      isActive: false,
      label: 'Snake case',
    },
  });

  return {
    colorDataConfig,
    syntaxConfig,
  };
}

export function useExportData(args: ExportDataComposableArgs) {
  const {
    images,
    colors,
    config,
  } = args;

  const colorDataConfig = toValue(config.colorDataConfig);
  const syntaxConfig = toValue(config.syntaxConfig);

  const transformColor = (color: Color) => {
    const colorKeys = Object.keys(color) as Array<keyof typeof color>;

    return colorKeys.reduce((acc: PartialMaybeSnakeCase<Color>, key) => {
      if (!colorDataConfig[key].isIncluded) return acc;

      const newKey = syntaxConfig.snakeCase.isActive ? camelToSnake(key) : key;

      return Object.defineProperty(acc, newKey, {
        value: color[key],
        enumerable: true,
      });
    }, {});
  };

  const transformColorObjectKeysReducer = (partialImageColors: PartialMaybeSnakeCase<Color>[], imageColor: ImageColor | null) => {
    if (!imageColor) return partialImageColors;

    const targetColor = imageColor.handpicked ?? imageColor.original;

    const result = transformColor(targetColor);

    if (isEmptyObject(result)) return partialImageColors;

    partialImageColors.push(result);

    return partialImageColors;
  };
  const transformColorObjectKeys = (colorsArray: Array<ImageColor | null>) => (colorsArray.reduce(transformColorObjectKeysReducer, []));

  const formatImageColorsReducer = (imageObjects: ExportImageData[], imageTuple: [ImageId, Img]): ExportImageData[] => {
    const [imageId, img] = imageTuple;
    const image = img.origin === 'file' ? img.fileName : img.originalSrc;

    const imageColors = colors.value.get(imageId);
    if (!imageColors) return imageObjects;

    const transformedColors: PartialMaybeSnakeCase<Color>[] = transformColorObjectKeys([...imageColors.values()]);

    imageObjects.push({
      image,
      colors: transformedColors,
    });

    return imageObjects;
  };
  const formatImageColors = (imageTuples: Array<[ImageId, Img]>) => (imageTuples.reduce(formatImageColorsReducer, []));

  const rawExportData = computed(() => {
    return formatImageColors([...images.value.entries()]);
  });

  const exportData = computed(() => {
    const result = rawExportData.value;

    return JSON.stringify(result, null, 2);
  });

  return {
    exportData,
    rawExportData,
  };
}
