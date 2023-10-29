<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { NSwitch } from 'naive-ui';
import { camelToSnake } from '@/shared/lib/string';
import type { HSL } from '@/shared/lib/color.ts';
import { isEmptyObject } from '@/shared/lib/assertions';
import type { ImageId, Img } from '@/entities/image';
import { useImagesStore } from '@/entities/image';
import type { Color, ImageColor } from '@/entities/color';
import { useColorsStore } from '@/entities/color';

const colorModel = useColorsStore();
const imagesModel = useImagesStore();

const { colors } = storeToRefs(colorModel);
const { images } = storeToRefs(imagesModel);

type MaybeStringValue<T> = {
  [key in keyof T]: T[key] | string;
};

type MaybeStringValueColor = Partial<MaybeStringValue<Color>>;

interface ImageObject {
  image: string;
  colors: MaybeStringValueColor[];
}

const colorConfig = ref<Record<keyof Color, { isIncluded: boolean; label: string }>>({
  hex: { isIncluded: true, label: 'Hex' },
  rgb: { isIncluded: true, label: 'RGB' },
  hsl: { isIncluded: true, label: 'HSL' },
  luminance: { isIncluded: true, label: 'Luminance' },
  rgbArray: { isIncluded: true, label: 'RGB Array' },
  hslArray: { isIncluded: true, label: 'HSL Array' },
});

const syntaxConfig = ref({
  snakeCase: { isActive: false, label: 'Snake case' },
});

function formatImageColors(imageObjects: ImageObject[], [imageId, img]: [ImageId, Img]): ImageObject[] {
  const image = img.origin === 'file' ? img.fileName : img.originalSrc;

  const imageColors = colors.value.get(imageId);
  if (!imageColors) return imageObjects;

  const formattedColors: MaybeStringValueColor[] = [...imageColors.values()]
    .reduce((partialImageColors: MaybeStringValueColor[], imageColor: ImageColor | null) => {
      if (!imageColor) return partialImageColors;

      const targetColor = imageColor.handpicked ?? imageColor.original;

      const colorData: MaybeStringValue<Color> = {
        hex: targetColor.hex,
        rgb: targetColor.rgb,
        hsl: targetColor.hsl,
        luminance: targetColor.luminance,
        rgbArray: targetColor.rgbArray,
        hslArray: targetColor.hslArray.map(Math.round) as HSL,
      };

      const appendProperty = (prop: keyof Color) => {
        return colorConfig.value[prop].isIncluded && { [syntaxConfig.value.snakeCase.isActive ? camelToSnake(prop) : prop]: colorData[prop] };
      };

      const partialColor: MaybeStringValueColor = {
        ...appendProperty('hex'),
        ...appendProperty('rgb'),
        ...appendProperty('hsl'),
        ...appendProperty('luminance'),
        ...appendProperty('rgbArray'),
        ...appendProperty('hslArray'),
      };

      if (isEmptyObject(partialColor)) return partialImageColors;

      partialImageColors.push(partialColor);

      return partialImageColors;
    }, []);

  const result: ImageObject = { image, colors: formattedColors };

  imageObjects.push(result);

  return imageObjects;
}

const imagesText = computed(() => {
  const _images = [...images.value.entries()].reduce(formatImageColors, []);

  const formatted = JSON.stringify(_images, null, 2);

  console.log(_images);

  return formatted;
});
</script>

<template>
  <section>
    <div class="my-3 flex flex-col flex-nowrap gap-1.5">
      <div
        v-for="switcher in colorConfig"
        :key="switcher.label"
        class="flex flex-nowrap items-center gap-2 text-black font-mono text-xs"
      >
        <NSwitch
          v-model:value="switcher.isIncluded"
          size="small"
          :round="false"
        />
        <div>{{ switcher.label }}</div>
      </div>
      <div
        v-for="switcher in syntaxConfig"
        :key="switcher.label"
        class="flex flex-nowrap items-center gap-2 text-black font-mono text-xs"
      >
        <NSwitch
          v-model:value="switcher.isActive"
          size="small"
          :round="false"
        />
        <div>{{ switcher.label }}</div>
      </div>
    </div>
    <pre>{{ imagesText }}</pre>
  </section>
</template>
