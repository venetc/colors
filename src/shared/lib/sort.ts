type Comparator<T> = (a: T, b: T) => number;

export class QuickSortInPlace {
  static sort<T>(array: T[], comparator: Comparator<T>): void {
    QuickSortInPlace.process(array, 0, array.length - 1, comparator);
  }

  private static process<T>(array: T[], leftPointerIndex = 0, rightPointerIndex = array.length - 1, comparator: Comparator<T>): void {
    if (leftPointerIndex < rightPointerIndex) {
      const pivotIndex = QuickSortInPlace.rearrangeAndGetPivotIndex(array, leftPointerIndex, rightPointerIndex, comparator);

      QuickSortInPlace.process(array, leftPointerIndex, pivotIndex - 1, comparator);
      QuickSortInPlace.process(array, pivotIndex + 1, rightPointerIndex, comparator);
    }
  }

  private static rearrangeAndGetPivotIndex<T>(array: T[], firstIndex = 0, lastIndex = array.length - 1, comparator: Comparator<T>): number {
    let pointerIndex: number = firstIndex;
    const itemToCompare: T = array[firstIndex];

    for (
      let currentIndex = firstIndex + 1;
      currentIndex <= lastIndex;
      currentIndex++
    ) {
      if (comparator(array[currentIndex], itemToCompare) <= 0) {
        pointerIndex++;
        QuickSortInPlace.swapByIndex(array, currentIndex, pointerIndex);
      }
    }

    QuickSortInPlace.swapByIndex(array, firstIndex, pointerIndex);

    return pointerIndex;
  }

  private static swapByIndex<T>(array: T[], indexA: number, indexB: number): void {
    [array[indexA], array[indexB]] = [array[indexB], array[indexA]];
  }
}
