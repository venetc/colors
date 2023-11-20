import { Group, Image } from 'lucide-vue-next';
import { storeToRefs } from 'pinia';
import { markRaw, ref, toRaw, toValue, watch } from 'vue';

import type { Color, ColorCollection, ImageColor } from '@/entities/color';
import type { ColorGroup, ColorGroupId } from '@/entities/colors-group';
import type { ImageId, Img } from '@/entities/image';
import type { CamelToSnakeCase, SnakeToCamelCase } from '@/shared/lib/string';
import type { MaybeRef, Ref } from 'vue';

import { useColors } from '@/entities/color';
import { useColorGroups } from '@/entities/colors-group';
import { useImages } from '@/entities/image';
import { camelToSnake, snakeToCamel } from '@/shared/lib/string';

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

export interface ExportColorGroupData {
  groupLeadColor: Partial<CamelOrSnakeKeys<Color>>;
  imagesInGroup: RawExportImageData[];
  groupId: ColorGroupId;
}

export interface ExportDataOrigin {
  images: Ref<Map<ImageId, Img>>;
  colors: Ref<Map<ImageId, ColorCollection>>;
  colorGroups: Ref<Map<ColorGroupId, ColorGroup>>;
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

export function useExportData(config: ExportConfig, currentViewTab: TabsConfig['activeTab'], origin?: ExportDataOrigin) {
  const colorDataConfig = toValue(config.colorDataConfig);
  const syntaxConfig = toValue(config.syntaxConfig);

  const imagesModel = useImages();
  const colorsModel = useColors();
  const colorGroupsModel = useColorGroups();

  const { images: storeImages } = storeToRefs(imagesModel);
  const { colors: storeColors } = storeToRefs(colorsModel);
  const { colorGroups: colorGroupsFromStore } = storeToRefs(colorGroupsModel);

  const images = origin?.images ?? storeImages;
  const colors = origin?.colors ?? storeColors;
  const colorGroups = origin?.colorGroups ?? colorGroupsFromStore;

  const imagesData = ref<RawExportImageData[]>([]);
  const colorGroupsData = ref<CamelOrSnakeKeys<ExportColorGroupData>[]>([]);
  // TODO refactor
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
  const generateColorGroupsData = () => {
    const result: CamelOrSnakeKeys<ExportColorGroupData>[] = [];

    colorGroups.value.forEach((colorGroup) => {
      const groupLeadColor = toRaw(transformColor(colorGroup.leadColor));

      const imagesInGroup: Record<string, RawExportImageData> = {};

      colorGroup.colors.forEach((color) => {
        const imageId = color.imageId;
        const image = images.value.get(imageId);
        const colorCollection = colors.value.get(imageId);
        if (!image || !colorCollection) return;

        const imageName = image.origin === 'file' ? image.fileName : image.originalSrc;
        const newColors: Partial<CamelOrSnakeKeys<Color>>[] = [];

        colorCollection.forEach((imageColor) => {
          transformImageColors(imageColor, newColors);
        });

        imagesInGroup[imageName] = {
          image: imageName,
          colors: newColors,
        };
      });

      const newColorGroup = {
        groupLeadColor,
        imagesInGroup: Object.values(imagesInGroup),
      };

      const transformedColorsGroup = {
        ...(transformRecord('groupLeadColor', newColorGroup.groupLeadColor)),
        ...(transformRecord('imagesInGroup', newColorGroup.imagesInGroup)),
      } as CamelOrSnakeKeys<ExportColorGroupData>;

      Object.defineProperty(transformedColorsGroup, 'groupId', { value: colorGroup.id, enumerable: false });

      result.push(toRaw(transformedColorsGroup));
    });

    return result;
  };

  watch([syntaxConfig, colorDataConfig, currentViewTab], ([, , activeTab]) => {
    imagesData.value = generateImagesData();
    if (activeTab === 'groups') {
      colorGroupsData.value = generateColorGroupsData();
    }
  }, {
    immediate: true,
    deep: true,
  });

  return {
    imagesData,
    colorGroupsData,
  };
}
