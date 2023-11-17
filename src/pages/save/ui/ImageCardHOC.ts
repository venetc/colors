import { storeToRefs } from 'pinia';
import { defineComponent, ref } from 'vue';
import type { ImageId } from '@/entities/image';
import { useColorsStore } from '@/entities/color';
import type { Color, ImageColor } from '@/entities/color';

export const ImageCardHOC = defineComponent({
  name: 'ImageCardHOC',
  setup(_, { slots }) {
    const colorsModel = useColorsStore();
    const { colors } = storeToRefs(colorsModel);

    const imageColors = ref<Color[]>([]);

    const getColors = (imageId: ImageId) => {
      const colorCollection = colors.value.get(imageId);
      if (!colorCollection) return [];

      imageColors.value = [...colorCollection.values()]
        .filter((color): color is ImageColor => !!color)
        .map(color => color.handpicked ?? color.original);
    };

    return () => slots.default?.({ getColors, imageColors: imageColors.value });
  },
});
