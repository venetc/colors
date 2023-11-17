import { Group, Image } from 'lucide-vue-next';
import { storeToRefs } from 'pinia';
import type { MaybeRef, Ref } from 'vue';
import { markRaw, ref, toRaw, toValue, watch } from 'vue';
import { camelToSnake, snakeToCamel } from '@/shared/lib/string';
import { useSortedColorsStore } from '@/features/color/sort-colors';
import type { Color, ColorCollection, ImageColor } from '@/entities/color';
import { useColorsStore } from '@/entities/color';
import type { ImageId, Img } from '@/entities/image';
import { useImagesStore } from '@/entities/image';
import type { ColorScheme, SchemeId } from '@/features/color/sort-colors';
import type { CamelToSnakeCase, SnakeToCamelCase } from '@/shared/lib/string';

export type SyntaxConfigOptions = 'snakeCase';
export type ColorDataConfig = Record<Exclude<keyof Color, 'hex'>, {
  isIncluded: boolean;
  label: string;
}>;
export type SyntaxConfig = Record<SyntaxConfigOptions, {
  isActive: boolean;
  label: string;
}>;
export type KeysToSnakeCase<T> = { [K in keyof T as CamelToSnakeCase<string & K>]: T[K] };
export type KeysToCamelCase<T> = { [K in keyof T as SnakeToCamelCase<string & K>]: T[K] };
export type CamelOrSnakeKeys<T> = KeysToCamelCase<T> | KeysToSnakeCase<T>;
export type PartialMaybeSnakeCase<T> = Partial<CamelOrSnakeKeys<T>>;

export interface TabsConfig {
  tabs: typeof TABS;
  activeTab: Ref<typeof TABS[number]['name']>;
}

export interface ExportConfig {
  colorDataConfig: MaybeRef<ColorDataConfig>;
  syntaxConfig: MaybeRef<SyntaxConfig>;
}

export interface RawExportImageData {
  image: string;
  colors: Partial<CamelOrSnakeKeys<Color>>[];
}

export interface ExportSchemeData {
  groupLeadColor: Partial<CamelOrSnakeKeys<Color>>;
  imagesInGroup: RawExportImageData[];
}

export interface ExportDataOrigin {
  images: Ref<Map<ImageId, Img>>;
  colors: Ref<Map<ImageId, ColorCollection>>;
  colorSchemes: Ref<Map<SchemeId, ColorScheme>>;
}

export const TABS = [
  {
    name: 'colors',
    label: 'Images colors',
    icon: markRaw(Image),
  },
  {
    name: 'groups',
    label: 'Grouped images',
    icon: markRaw(Group),
  },
] as const;

export function usePreviewTabs() {
  const tabs = TABS;
  const activeTab = ref(TABS[0].name);

  return {
    tabs,
    activeTab,
  };
}

export function useExportDataConfig() {
  const colorDataConfig = ref<ColorDataConfig>({
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

// TODO refactor this pile of shit
export function useExportData(exportConfig: ExportConfig, currentViewTab: TabsConfig['activeTab'], origin?: ExportDataOrigin) {
  const colorDataConfig = toValue(exportConfig.colorDataConfig);
  const syntaxConfig = toValue(exportConfig.syntaxConfig);

  const imagesStore = useImagesStore();
  const colorsStore = useColorsStore();
  const sortedColorsStore = useSortedColorsStore();

  const { images: storeImages } = storeToRefs(imagesStore);
  const { colors: storeColors } = storeToRefs(colorsStore);
  const { colorSchemes: storeSchemes } = storeToRefs(sortedColorsStore);

  const images = origin?.images ?? storeImages;
  const colors = origin?.colors ?? storeColors;
  const colorSchemes = origin?.colorSchemes ?? storeSchemes;

  const imagesData = ref<RawExportImageData[]>([]);
  const schemesData = ref<CamelOrSnakeKeys<ExportSchemeData>[]>([]);

  const transformRecord = <T extends Record<string, unknown>, K extends keyof T & string>(key: K, value: T[K]) => {
    return { [syntaxConfig.snakeCase.isActive ? camelToSnake(key) : snakeToCamel(key)]: value };
  };

  const transformColor = (targetColor: Color): Partial<CamelOrSnakeKeys<Color>> => {
    return {
      hex: targetColor.hex,
      ...(colorDataConfig.rgb.isIncluded && transformRecord('rgb', targetColor.rgb)),
      ...(colorDataConfig.hsl.isIncluded && transformRecord('hsl', targetColor.hsl)),
      ...(colorDataConfig.luminance.isIncluded && transformRecord('luminance', targetColor.luminance)),
      ...(colorDataConfig.rgbArray.isIncluded && transformRecord('rgbArray', targetColor.rgbArray)),
      ...(colorDataConfig.hslArray.isIncluded && transformRecord('hslArray', targetColor.hslArray)),
    };
  };

  const transformImageColors = (imageColor: ImageColor | null, array: Partial<CamelOrSnakeKeys<Color>>[]) => {
    if (!imageColor) return;
    const targetColor = imageColor.handpicked ?? imageColor.original;

    const newColor: Partial<CamelOrSnakeKeys<Color>> = transformColor(targetColor);

    array.push(toRaw(newColor));
  };

  const generateImagesData = () => {
    const result: RawExportImageData[] = [];

    colors.value.forEach((colorCollection, imageId) => {
      const image = images.value.get(imageId);
      if (!image) return;

      const imageName = image.origin === 'file' ? image.fileName : image.originalSrc;
      const colors: Partial<CamelOrSnakeKeys<Color>>[] = [];

      colorCollection.forEach((imageColor) => {
        transformImageColors(imageColor, colors);
      });

      const imageData: RawExportImageData = {
        image: imageName,
        colors,
      };

      result.push(imageData);
    });

    return result;
  };

  const generateSchemesData = () => {
    const result: CamelOrSnakeKeys<ExportSchemeData>[] = [];

    colorSchemes.value.forEach((colorScheme) => {
      const groupLeadColor = toRaw(transformColor(colorScheme.leadColor));

      const imagesInGroup: RawExportImageData[] = [];

      colorScheme.colors.forEach((color) => {
        const imageId = color.imageId;
        const image = images.value.get(imageId);
        const colorCollection = colors.value.get(imageId);
        if (!image || !colorCollection) return;

        const imageName = image.origin === 'file' ? image.fileName : image.originalSrc;
        const newColors: Partial<CamelOrSnakeKeys<Color>>[] = [];

        colorCollection.forEach((imageColor) => {
          transformImageColors(imageColor, newColors);
        });

        const imageData: RawExportImageData = {
          image: imageName,
          colors: newColors,
        };

        imagesInGroup.push(imageData);
      });

      const newScheme = {
        groupLeadColor,
        imagesInGroup,
      };

      const transformedScheme = {
        ...(transformRecord('groupLeadColor', newScheme.groupLeadColor)),
        ...(transformRecord('imagesInGroup', newScheme.imagesInGroup)),
      } as CamelOrSnakeKeys<ExportSchemeData>;

      result.push(toRaw(transformedScheme));
    });

    return result;
  };

  watch([syntaxConfig, colorDataConfig, currentViewTab],
    ([, , activeTab]) => {
      imagesData.value = generateImagesData();
      if (activeTab === 'groups') {
        schemesData.value = generateSchemesData();
      }
    },
    {
      immediate: true,
      deep: true,
    });

  return {
    imagesData,
    schemesData,
  };
}
