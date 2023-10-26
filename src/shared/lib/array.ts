/**
 * Разбивает массив на чанки
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  if (!Array.isArray(array) || !array.length) return [];
  if (!size) return [array];

  const head = array.slice(0, size);
  const tail = array.slice(size);

  return [head, ...chunkArray(tail, size)];
}
/**
 * Shuffles array in place using Fisher–Yates shuffle algorithm.
 */
export function shuffle<T>(array: T[]): T[] {
  let j;
  let temp;
  for (let i = array.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    temp = array[j] as T;
    array[j] = array[i] as T;
    array[i] = temp;
  }
  return array;
}
/**
 * Groups the elements of an array based on the given function.
 */
export function groupBy<T extends Record<string, unknown> = Record<string, unknown>>(array: T[], key: keyof T): Record<keyof T, T[]> {
  return array.reduce(
    (objectsByKeyValue, obj) => ({
      ...objectsByKeyValue,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error

      [obj[key]]: (objectsByKeyValue[obj[key]] || []).concat(obj),
    }),
    {} as Record<keyof T, T[]>,
  );
}
/**
 * Generate an array of numbers, for iteration
 *
 * @example
 * // You can pass a single number, to generate a range from 0 through that number:
 * range(5); // [0, 1, 2, 3, 4]
 *
 * // You can pass two numbers, to generate a range from start to finish:
 * range(5, 10); // [5, 6, 7, 8, 9]
 *
 * // Finally, you can pass a third "step" argument, if you want to change the gap between numbers:
 * range(0, 6, 2); // [0, 2, 4]
 * range(10, 12, 0.5); // [10, 10.5, 11, 11.5]
 *
 * @note
 * You will notice that the array produced is inclusive of the starting number, but exclusive of the ending number.
 * `range(10, 20)` includes 10, but does not include 20.
 * This is done intentionally, to match the behaviour of JavaScript methods like slice.
 *
 * @see https://www.joshwcomeau.com/snippets/javascript/range/
 */
export function range(start: number, end?: number, step = 1) {
  const output = [];
  const startEdge = end ? start : 0;
  const endEdge = end ?? start;
  for (let i = startEdge; i < endEdge; i += step)
    output.push(i);

  return output;
}
