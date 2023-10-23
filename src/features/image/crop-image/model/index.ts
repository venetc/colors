import { useElementBounding } from '@vueuse/core';
import { computed, inject, nextTick, ref } from 'vue';
import type { Ref } from 'vue';
import { cropperInfrastructureData } from '../lib';
import type { Img } from '@/entities/image';
import { cover } from '@/shared/lib/canvas';

export interface Coordinates {
  x: number;
  y: number;
}

export type ExposedCropperData = Pick<ReturnType<typeof useImageCropper>, 'init' | 'mouseUp' | 'mouseDown' | 'mouseMove' | 'reset' | 'crop' | 'undo' | 'redo' | 'toggleDrawing'>;

const SCALE_FACTOR = 1;

export interface CropperParams {
  currentPointers: Ref<Coordinates[]>;
  image: Ref<Img>;
  canvasElement: Ref<HTMLCanvasElement | undefined>;
  imageElement: Ref<HTMLImageElement | undefined>;
  parentElement: Ref<HTMLElement | undefined>;
  cropCallback?: (croppedImage: string) => void;
}

export const ratios = [
  {
    label: '16:9',
    value: '16:9',
  },
  {
    label: '9:16',
    value: '9:16',
  },
  {
    label: '21:9',
    value: '21:9',
  },
  {
    label: '9:21',
    value: '9:21',
  },
  {
    label: '1:1',
    value: '1:1',
  },
];

export const selectedRatio = ref<typeof ratios[number]>(ratios[0]);

export function ratioSelectHandler(variant: typeof ratios[number]) {
  selectedRatio.value = variant;
}

export function ratioClassHandler() {
  switch (selectedRatio.value.value) {
    case '16:9':
      return 'w-full h-full';
    case '9:16':
      return 'w-[39%] h-full';
    case '1:1':
      return 'w-[62.5%] h-full';
    case '21:9':
      return 'w-full h-[68.5%]';
    case '9:21':
      return 'w-[26.7%] h-full';
    default:
      return 'w-full h-full';
  }
}

export const ratioClass = computed(ratioClassHandler);

export function useImageCropper(params: CropperParams) {
  const {
    currentPointers,
    image,
    canvasElement,
    imageElement,
    parentElement,
    cropCallback,
  } = params;

  const cropperInfraData = inject(cropperInfrastructureData);

  const undoPointers = ref<Coordinates[]>([]);
  const redoPointers = ref<Coordinates[]>([]);
  const isDrawingMode = ref(true);
  const isEditing = ref(true);
  const isCropped = ref(!!image.value.croppedSrc);

  const isDrawingInProgress = ref(false);

  const canvasRef = canvasElement;
  const canvasParent = parentElement;
  const imageRef = imageElement;

  const imageObj = ref<HTMLImageElement | null>(null);
  const position = ref<Coordinates | null>(null);
  const positionOld = ref<Coordinates | null>(null);
  const ctx = ref<CanvasRenderingContext2D | null>();
  const redoSnapshots = ref<string[]>([]);
  const undoSnapshots = ref<string[]>([]);
  const resultImage = ref<string | null>(null);

  const imgWidth = ref(0);
  const imgHeight = ref(0);

  const init = () => {
    if (!canvasRef.value) return;

    ctx.value = canvasRef.value.getContext('2d', { willReadFrequently: true });
    if (ctx.value) ctx.value.imageSmoothingEnabled = false;

    const img = new Image();

    img.crossOrigin = 'anonymous';
    img.src = image.value.croppedSrc ?? image.value.blobSrc;

    img.onload = () => {
      setTimeout(() => {
        if (!ctx.value) return;

        const {
          width: parentWidth,
          height: parentHeight,
        } = useElementBounding(canvasParent);

        if (imageRef.value) {
          imageRef.value.width = Math.round(parentWidth.value);
          imageRef.value.height = Math.round(parentHeight.value);
        }

        imgWidth.value = Math.round(parentWidth.value);
        imgHeight.value = Math.round(parentHeight.value);
        ctx.value.canvas.width = Math.round(parentWidth.value) * SCALE_FACTOR;
        ctx.value.canvas.height = Math.round(parentHeight.value) * SCALE_FACTOR;

        const {
          offsetX,
          offsetY,
          width: _width,
          height: _height,
        } = cover(Math.round(parentWidth.value), Math.round(parentHeight.value), Math.round(img.naturalWidth) * SCALE_FACTOR, Math.round(img.naturalHeight) * SCALE_FACTOR);

        ctx.value.drawImage(img, (offsetX * SCALE_FACTOR), (offsetY * SCALE_FACTOR), (_width * SCALE_FACTOR), (_height * SCALE_FACTOR));

        if (!canvasRef.value) return;

        canvasRef.value.toBlob((blob) => {
          if (!blob) return;
          const canvasImg = new Image();
          canvasImg.crossOrigin = 'anonymous';

          canvasImg.onload = () => {
            if (imageObj.value) URL.revokeObjectURL(imageObj.value.src);
            imageObj.value = canvasImg;

            URL.revokeObjectURL(canvasImg.src);
          };

          canvasImg.src = URL.createObjectURL(blob);
        });

        cropperInfraData?.setCurrentPointersAmount(currentPointers.value.length);
        cropperInfraData?.setUndoPointersAmount(undoPointers.value.length);
        cropperInfraData?.setRedoPointersAmount(redoPointers.value.length);
        cropperInfraData?.setIsDrawingModeFlag(isDrawingMode.value);
        cropperInfraData?.setIsEditingModeFlag(isEditing.value);
        cropperInfraData?.setIsImageCroppedFlag(isCropped.value);
      }, 300);
    };
  };

  const empty = () => {
    redoSnapshots.value = [];
    undoSnapshots.value = [];
    redoPointers.value = [];
    undoPointers.value = [];
    currentPointers.value = [];

    cropperInfraData?.setRedoPointersAmount(redoPointers.value.length);
    cropperInfraData?.setUndoPointersAmount(undoPointers.value.length);
    cropperInfraData?.setCurrentPointersAmount(currentPointers.value.length);
  };

  const reset = async () => {
    await nextTick(() => {
      empty();
      if (imageObj.value) URL.revokeObjectURL(imageObj.value.src);
      imageObj.value = null;
      resultImage.value = null;
      isCropped.value = false;
      cropperInfraData?.setIsImageCroppedFlag(isCropped.value);
      positionOld.value = position.value = null;
      init();
    });
  };

  const savePointer = (point: Coordinates) => {
    redoPointers.value = [];
    currentPointers.value.push(point);
    undoPointers.value.push(point);

    cropperInfraData?.setCurrentPointersAmount(currentPointers.value.length);
    cropperInfraData?.setUndoPointersAmount(undoPointers.value.length);
    cropperInfraData?.setRedoPointersAmount(redoPointers.value.length);
  };

  const restorePointer = (pointersToPop: Coordinates[], pointersToPush: Coordinates[], isUndo: boolean) => {
    if (pointersToPop.length === 0) return;

    const item = pointersToPop.pop();
    if (!item) return;

    pointersToPush.push(item);

    if (isUndo) {
      currentPointers.value.pop();

      if (pointersToPop.length > 0) {
        const {
          x,
          y,
        } = pointersToPop[pointersToPop.length - 1];

        positionOld.value = {
          x,
          y,
        };
      } else {
        positionOld.value = null;
      }
    } else {
      currentPointers.value.push(item);

      if (pointersToPush.length > 0) {
        const {
          x,
          y,
        } = pointersToPush[pointersToPush.length - 1];

        positionOld.value = {
          x,
          y,
        };
      }
    }

    cropperInfraData?.setCurrentPointersAmount(currentPointers.value.length);
    cropperInfraData?.setUndoPointersAmount(undoPointers.value.length);
    cropperInfraData?.setRedoPointersAmount(redoPointers.value.length);
  };

  const saveState = (canvas: HTMLCanvasElement, list = undoSnapshots.value, keepRedo = false) => {
    if (!keepRedo) redoSnapshots.value = [];

    const data = canvas.toDataURL();
    list.push(data);
  };

  const restoreState = (marksToPop: string[], marksToPush: string[]) => {
    if (marksToPop.length) {
      if (!canvasRef.value) return;

      saveState(canvasRef.value, marksToPush, true);

      const restoredState = marksToPop.pop();
      if (!restoredState) return;

      const img = new Image();
      img.src = restoredState;
      img.onload = () => {
        if (!ctx.value) return;

        ctx.value.clearRect(0, 0, imgWidth.value * SCALE_FACTOR, imgHeight.value * SCALE_FACTOR);
        ctx.value.drawImage(img, 0, 0);
      };
    }
  };

  const undo = () => {
    if (!isEditing.value || isDrawingMode.value) return;

    isEditing.value = false;
    cropperInfraData?.setIsEditingModeFlag(isEditing.value);
    restoreState(undoSnapshots.value, redoSnapshots.value);
    restorePointer(undoPointers.value, redoPointers.value, true);
    isEditing.value = true;
    cropperInfraData?.setIsEditingModeFlag(isEditing.value);
  };

  const redo = () => {
    if (!isEditing.value || isDrawingMode.value) return;

    isEditing.value = false;
    cropperInfraData?.setIsEditingModeFlag(isEditing.value);
    restoreState(redoSnapshots.value, undoSnapshots.value);
    restorePointer(redoPointers.value, undoPointers.value, false);
    isEditing.value = true;
    cropperInfraData?.setIsEditingModeFlag(isEditing.value);
  };

  const trimEmptyPixel = (canvasElement: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    interface Bound {
      top?: number;
      left?: number;
      right?: number;
      bottom?: number;
    }

    const pixels = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);

    const amountOfPixels = pixels.data.length;

    const bound: Bound = {};
    let x, y, i;

    for (i = 0; i < amountOfPixels; i += 4) {
      const alpha = pixels.data[i + 3];
      const opaque = alpha !== 0;

      if (opaque) {
        x = (i / 4) % canvasElement.width;
        y = ~~((i / 4) / canvasElement.width);

        if (!bound.top) bound.top = y;
        if (!bound.left || x < bound.left) bound.left = x;
        if (!bound.right || bound.right < x) bound.right = x;
        if (!bound.bottom || bound.bottom < y) bound.bottom = y;
      }
    }

    if (!bound.bottom || !bound.top || !bound.right || !bound.left) return;

    const trimHeight = bound.bottom - bound.top;
    const trimWidth = bound.right - bound.left;
    const trimmed = ctx.getImageData(bound.left, bound.top, trimWidth, trimHeight);

    ctx.putImageData(trimmed, bound.left, bound.top);
  };

  const crop = () => {
    if (!isEditing.value || isCropped.value) return;
    if (!ctx.value || !canvasRef.value || !imageObj.value) return;
    if (currentPointers.value.length < 1) return;

    ctx.value.clearRect(0, 0, imgWidth.value * SCALE_FACTOR, imgHeight.value * SCALE_FACTOR);
    ctx.value.beginPath();
    ctx.value.globalCompositeOperation = 'destination-over';
    const left = canvasRef.value.offsetLeft;
    const top = canvasRef.value.offsetTop;

    for (let i = 0; i < currentPointers.value.length; i++) {
      const {
        x,
        y,
      } = currentPointers.value[i];

      i === 0
        ? ctx.value.moveTo(x * SCALE_FACTOR - left, y * SCALE_FACTOR - top)
        : ctx.value.lineTo(x * SCALE_FACTOR - left, y * SCALE_FACTOR - top);
    }

    const pattern = ctx.value.createPattern(imageObj.value, 'repeat');
    if (!pattern) return;

    ctx.value.fillStyle = pattern;
    ctx.value.fill();

    trimEmptyPixel(canvasRef.value, ctx.value);

    canvasRef.value.toBlob((blob) => {
      if (!blob || !canvasRef.value) return;

      const img = new Image();
      img.src = URL.createObjectURL(blob);

      img.onload = () => {
        if (cropCallback) cropCallback(img.src);
      };

      empty();
      isCropped.value = true;
      cropperInfraData?.setIsImageCroppedFlag(isCropped.value);
    });
  };

  const mouseDown = (e: MouseEvent) => {
    if (!isEditing.value) return;
    if (isCropped.value) return;
    if (!ctx.value || !canvasRef.value) return;

    if (isDrawingMode.value) {
      isDrawingInProgress.value = true;
    } else {
      void nextTick(() => {
        if (!ctx.value || !canvasRef.value) return;

        saveState(canvasRef.value);

        if (positionOld.value && position.value && undoSnapshots.value.length > 0) {
          const {
            x: oldX,
            y: oldY,
          } = positionOld.value;

          position.value = {
            x: e.offsetX,
            y: e.offsetY,
          };

          const {
            x,
            y,
          } = position.value;

          ctx.value.beginPath();
          ctx.value.strokeStyle = '#ff0000';
          ctx.value.lineWidth = 1.5 * SCALE_FACTOR;
          ctx.value.lineCap = 'round';
          ctx.value.moveTo(oldX * SCALE_FACTOR, oldY * SCALE_FACTOR);
          ctx.value.lineTo(x * SCALE_FACTOR, y * SCALE_FACTOR);
          ctx.value.stroke();
        }

        savePointer({
          x: e.offsetX,
          y: e.offsetY,
        });

        positionOld.value = position.value = {
          x: e.offsetX,
          y: e.offsetY,
        };
      });
    }
  };

  const mouseUp = () => {
    if (!isDrawingMode.value) return;
    isDrawingInProgress.value = false;
  };

  const mouseMove = (e: MouseEvent) => {
    if (!isEditing.value) return;

    position.value = {
      x: e.offsetX,
      y: e.offsetY,
    };

    if (!isDrawingInProgress.value) return;

    savePointer({
      x: position.value.x,
      y: position.value.y,
    });

    if (!ctx.value) return;

    const last = currentPointers.value[currentPointers.value.length - 1];
    const nextToLast = currentPointers.value[currentPointers.value.length - 2] ?? last;

    ctx.value.beginPath();
    ctx.value.lineWidth = 1.5 * SCALE_FACTOR;
    ctx.value.lineCap = 'round';
    ctx.value.strokeStyle = '#ff0000';
    ctx.value.moveTo(nextToLast.x * SCALE_FACTOR, nextToLast.y * SCALE_FACTOR);
    ctx.value.lineTo(last.x * SCALE_FACTOR, last.y * SCALE_FACTOR);
    ctx.value.stroke();
  };

  const edit = () => {
    if (!isCropped.value) void reset();
    isEditing.value = !isEditing.value;
    cropperInfraData?.setIsEditingModeFlag(isEditing.value);
    if (!isEditing.value) {
      isDrawingMode.value = false;
      cropperInfraData?.setIsDrawingModeFlag(isDrawingMode.value);
    }
  };

  const toggleDrawing = () => {
    if (!isEditing.value) return;
    if (isCropped.value || !(isCropped.value && isDrawingMode.value)) void reset();

    isDrawingMode.value = !isDrawingMode.value;
    cropperInfraData?.setIsDrawingModeFlag(isDrawingMode.value);
  };

  return {
    init,
    undo,
    redo,
    crop,
    mouseDown,
    mouseUp,
    mouseMove,
    edit,
    toggleDrawing,
    reset,
    isDrawingMode,
    isEditing,
    isCropped,
    currentPointers,
  };
}
