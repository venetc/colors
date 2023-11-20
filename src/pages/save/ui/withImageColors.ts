import { storeToRefs } from 'pinia';
import { defineComponent, ref } from 'vue';

import type { ImageId } from '@/entities/image';
import type { ImageColor } from '@/entities/color';

import { useColors } from '@/entities/color';

export const WithImageColors = defineComponent({
  name: 'WithImageColors',
  setup(_, { slots }) {
    const colorsModel = useColors();
    const { colors } = storeToRefs(colorsModel);

    const imageColors = ref<ImageColor[]>([]);

    const getColorsByImageId = (imageId: ImageId) => {
      const colorCollection = colors.value.get(imageId);
      if (!colorCollection) return [];

      const flatColorCollection = colorsModel.nonEmptyColorCollection(colorCollection);

      imageColors.value = flatColorCollection.map(([_, imageColor]) => (imageColor));
    };

    return () => slots.default?.({ getColorsByImageId, imageColors: imageColors.value });
  },
});
