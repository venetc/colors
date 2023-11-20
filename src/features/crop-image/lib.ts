import { ref } from 'vue';

import type { InjectionKey } from 'vue';

export function useCropperInfraData() {
  const currentPointersAmount = ref(0);
  const undoPointersAmount = ref(0);
  const redoPointersAmount = ref(0);
  const isDrawingModeFlag = ref(true);
  const isEditingModeFlag = ref(true);
  const isImageCroppedFlag = ref(false);
  const isCanvasHiddenFlag = ref(false);

  const setCurrentPointersAmount = (amount: number): void => {
    currentPointersAmount.value = amount;
  };
  const setUndoPointersAmount = (amount: number): void => {
    undoPointersAmount.value = amount;
  };
  const setRedoPointersAmount = (amount: number): void => {
    redoPointersAmount.value = amount;
  };
  const setIsDrawingModeFlag = (flag: boolean): void => {
    isDrawingModeFlag.value = flag;
  };
  const setIsEditingModeFlag = (flag: boolean): void => {
    isEditingModeFlag.value = flag;
  };
  const setIsImageCroppedFlag = (flag: boolean): void => {
    isImageCroppedFlag.value = flag;
  };
  const setIsCanvasHiddenFlag = (flag: boolean): void => {
    isCanvasHiddenFlag.value = flag;
  };

  return {
    currentPointersAmount,
    undoPointersAmount,
    redoPointersAmount,
    isDrawingModeFlag,
    isEditingModeFlag,
    isImageCroppedFlag,
    isCanvasHiddenFlag,
    setCurrentPointersAmount,
    setUndoPointersAmount,
    setRedoPointersAmount,
    setIsDrawingModeFlag,
    setIsEditingModeFlag,
    setIsImageCroppedFlag,
    setIsCanvasHiddenFlag,
  };
}

export const cropperInfrastructureData = Symbol('Cropper infrastructure data') as InjectionKey<ReturnType<typeof useCropperInfraData>>;
