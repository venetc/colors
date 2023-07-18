import { defineStore } from 'pinia';
import { ref } from 'vue';

interface CoreProps { src: string; colors: string[] }
export type ImageFromFile = CoreProps & { origin: 'file'; fileName: string };
export type ImageFromLink = CoreProps & { origin: 'link'; originalSrc: string };
export type Img = ImageFromFile | ImageFromLink;

export const useImagesStore = defineStore('ImagesStore', () => {
  const images = ref<Map<string, Img>>(new Map());

  const addImageToList = (token: string, image: Img) => {
    if (images.value.has(token))
      return;

    images.value.set(token, image);
  };
  const removeImageFromList = (token: string) => {
    return images.value.delete(token);
  };

  return { images, addImageToList, removeImageFromList };
});
