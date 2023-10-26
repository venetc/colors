<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { NSwitch } from 'naive-ui';
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
  rgbArray: { isIncluded: true, label: 'RGB Array' },
  hsl: { isIncluded: true, label: 'HSL' },
  hslArray: { isIncluded: true, label: 'HSL Array' },
  luminance: { isIncluded: true, label: 'Luminance' },
});

// const imagesToArray = (_images: typeof images) => ([..._images.value.entries()]);

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
        rgbArray: JSON.stringify(targetColor.rgbArray),
        hsl: targetColor.hsl,
        hslArray: JSON.stringify(targetColor.hslArray.map(Math.round)),
        luminance: targetColor.luminance,
      };

      const appendProperty = (prop: keyof Color) => {
        return colorConfig.value[prop].isIncluded && { [prop]: colorData[prop] };
      };

      const partialColor: MaybeStringValueColor = {
        ...appendProperty('hex'),
        ...appendProperty('rgb'),
        ...appendProperty('rgbArray'),
        ...appendProperty('hsl'),
        ...appendProperty('hslArray'),
        ...appendProperty('luminance'),
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

  return JSON.stringify(_images, null, 2);
});
</script>

<template>
  <section>
    <div class="my-3">
      <div
        v-for="switcher in colorConfig"
        :key="switcher.label"
        class="flex flex-nowrap items-center gap-3 text-black"
      >
        <div>{{ switcher.label }}</div>
        <NSwitch v-model:value="switcher.isIncluded" />
      </div>
    </div>
    <pre>{{ imagesText }}</pre>
  </section>
</template>

<style scoped>

</style>
