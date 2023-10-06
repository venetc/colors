import { useElementBounding } from '@vueuse/core';
import { computed, ref, toRaw } from 'vue';
import type { Ref } from 'vue';
import type { Img } from '@/entities/image';
import { cover } from '@/shared/lib/canvas';

export interface Coordinates {
  x: number;
  y: number;
}

export type ExposedCropperData = ReturnType<typeof useImageCropper>;

export interface CroppedImageData {
  image: Img;
  cropped: string | undefined;
}

const SCALE_FACTOR = 1;

export interface CropperParams {
  canvasElement: Ref<HTMLCanvasElement | undefined>;
  parentElement: Ref<HTMLElement | undefined>;
  imageElement: Ref<HTMLImageElement | undefined>;
  image: Ref<Img>;
  cropCallback?: (data: CroppedImageData) => void;
}

export function useImageCropper(params: CropperParams) {
  const {
    image,
    imageElement,
    canvasElement,
    parentElement,
    cropCallback,
  } = params;

  const isEditing = ref(true);
  const isDrawingMode = ref(false);
  const isCropped = ref(false);
  const canvasIsHidden = ref(false);

  const isDrawingInProgress = ref(false);

  const canvasRef = canvasElement;
  const canvasParent = parentElement;
  const imageRef = imageElement;

  const imageObj = ref<HTMLImageElement | null>();
  const position = ref<Coordinates | null>(null);
  const positionOld = ref<Coordinates | null>(null);
  const ctx = ref<CanvasRenderingContext2D | null>();
  const redoSnapshots = ref<string[]>([]);
  const undoSnapshots = ref<string[]>([]);
  const redoPointers = ref<Coordinates[]>([]);
  const undoPointers = ref<Coordinates[]>([]);
  const currentPointers = ref<Coordinates[]>([]);
  const resultImage = ref<string | null>(null);

  const imgWidth = ref(0);
  const imgHeight = ref(0);

  const ratios = [
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

  const selectedRatio = ref<typeof ratios[number]['value']>(ratios[0].value);

  const ratioClassHandler = () => {
    switch (selectedRatio.value) {
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
  };

  const ratioClass = computed(ratioClassHandler);

  const init = () => {
    if (!canvasRef.value) return;

    ctx.value = canvasRef.value.getContext('2d', { willReadFrequently: true });
    if (ctx.value) ctx.value.imageSmoothingEnabled = false;

    const img = new Image();

    img.crossOrigin = 'anonymous';
    img.src = image.value.blobSrc;

    img.onload = () => {
      if (!ctx.value) return;

      const {
        width: parentWidth,
        height: parentHeight,
      } = useElementBounding(canvasParent);

      if (imageRef.value) {
        imageRef.value.width = Math.round(parentWidth.value);
        imageRef.value.height = Math.round(parentHeight.value);
      }

      imgWidth.value = Math.round(parentWidth.value) > 0 ? Math.round(parentWidth.value) : img.width;
      imgHeight.value = Math.round(parentHeight.value) > 0 ? Math.round(parentHeight.value) : img.height;
      ctx.value.canvas.width = Math.round(parentWidth.value) * SCALE_FACTOR;
      ctx.value.canvas.height = Math.round(parentHeight.value) * SCALE_FACTOR;

      const {
        offsetX,
        offsetY,
        width: _width,
        height: _height,
      } = cover(Math.round(parentWidth.value), Math.round(parentHeight.value), Math.round(img.naturalWidth) * SCALE_FACTOR, Math.round(img.naturalHeight) * SCALE_FACTOR);

      ctx.value.drawImage(img, ((offsetX) * SCALE_FACTOR), ((offsetY) * SCALE_FACTOR), ((_width) * SCALE_FACTOR), ((_height) * SCALE_FACTOR));

      const canvasImg = new Image();
      if (!canvasRef.value) return;

      canvasImg.crossOrigin = 'anonymous';
      canvasImg.src = canvasRef.value.toDataURL();
      canvasImg.onload = () => {
        imageObj.value = canvasImg;
      };
    };
  };

  const empty = () => {
    redoSnapshots.value = [];
    undoSnapshots.value = [];
    redoPointers.value = [];
    undoPointers.value = [];
    currentPointers.value = [];
  };

  const reset = () => {
    empty();
    imageObj.value = null;
    resultImage.value = null;
    isCropped.value = false;
    positionOld.value = position.value = null;
    init();
  };

  const savePointer = (point: Coordinates) => {
    redoPointers.value = [];
    currentPointers.value.push(point);
    undoPointers.value.push(point);
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
    restoreState(undoSnapshots.value, redoSnapshots.value);
    restorePointer(undoPointers.value, redoPointers.value, true);
    isEditing.value = true;
  };

  const redo = () => {
    if (!isEditing.value || isDrawingMode.value) return;

    isEditing.value = false;
    restoreState(redoSnapshots.value, undoSnapshots.value);
    restorePointer(redoPointers.value, undoPointers.value, false);
    isEditing.value = true;
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

    const img = new Image();
    img.src = canvasRef.value.toDataURL();
    img.onload = () => {
      if (cropCallback) cropCallback({
        image: toRaw(image.value),
        cropped: img.src,
      });
    };

    empty();
    isCropped.value = true;
  };

  /*
  function sendColors(img: HTMLImageElement) {
    const palette = getPalette({
      img,
      colorCount: 5,
      quality: 2,
    });

    const colors = palette ? palette.map(rgbToHex) : [];

    emit('onColorsSend', colors);
  }
*/

  const mouseDown = (e: MouseEvent) => {
    if (!isEditing.value) return;
    if (isCropped.value) return;
    if (!ctx.value || !canvasRef.value) return;

    if (isDrawingMode.value) {
      isDrawingInProgress.value = true;
    } else {
      saveState(canvasRef.value);

      if (positionOld.value && position.value && undoSnapshots.value.length > 0) {
        const {
          x: oldX,
          y: oldY,
        } = positionOld.value;

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
    if (!isCropped.value) reset();
    isEditing.value = !isEditing.value;
    if (!isEditing.value) isDrawingMode.value = false;
  };

  const toggleDrawing = () => {
    if (!isEditing.value) return;
    if (!isDrawingMode.value || !isCropped.value) reset();
    isDrawingMode.value = !isDrawingMode.value;
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
    canvasIsHidden,
    redoPointers,
    undoPointers,
    ratioClass,
    ratios,
    selectedRatio,
  };
}
