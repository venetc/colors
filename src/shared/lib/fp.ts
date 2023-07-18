/**
 * Returns `true` if the provided predicate function returns `true` for all elements in a collection, `false` otherwise.
 */
export const all = <T>(arr: T[], fn: (value: T) => boolean) => arr.every(fn);
/**
 * Returns `true` if both arguments are `true`, `false` otherwise.
 */
export const and = <T = boolean>(a: T, b: T) => Boolean(a) && Boolean(b);
/**
 * Returns `true` if the provided predicate function returns `true` for at least one element in a collection, `false` otherwise.
 */
export const any = <T = unknown>(arr: T[], fn: (t: T) => boolean) => arr.some(fn);
type Func$1<T> = (...args: T[]) => unknown;
/**
 * Returns `true` if both functions return `true` for a given set of arguments, `false` otherwise.
 */
export const both = <T = unknown>(f: Func$1<T>, g: Func$1<T>) => (...args: T[]) => f(...args) && g(...args);
/**
 * Returns `true` if at least one function returns `true` for a given set of arguments, `false` otherwise.
 */
export const either = <T = unknown>(f: Func$1<T>, g: Func$1<T>) => (...args: T[]) => f(...args) || g(...args);
/**
 * Returns the last element in an array.
 */
export const last = <T>(arr: T[]) => arr[arr.length - 1];
export const none = <T>(arr: T[], fn: (val: unknown) => boolean) => !arr.some(fn);
/**
 * Returns the logical inverse of the given value.
 */
export const not = (a: unknown) => !a;
/**
 * Returns `true` if at least one of the arguments is `true`, false otherwise.
 */
export const or = (a: unknown, b: unknown) => a || b;
/**
 * Returns new array by removing elements for which the given function returns false.
 */
export function remove<T>(arr: T[], func: (value: T, index: number, array: T[]) => boolean) {
  return Array.isArray(arr)
    ? arr.filter(func).reduce((acc, val) => {
      arr.splice(arr.indexOf(val), 1);
      return acc.concat(val);
    }, [] as T[])
    : [];
}
/**
 * Gets the size of an array, object or string.
 */
export function size(val: Record<string, unknown> | [] | string) {
  return Array.isArray(val) || typeof val === 'string'
    ? val.length
    : val.size || val.length || Object.keys(val).length;
}

type Comparator<T> = (a: T, b: T) => number;
export const compareString: Comparator<string> = (left, right) => {
  if (left < right)
    return -1;
  if (left > right)
    return 1;
  return 0;
};
export const compareLength: Comparator<string | Array<unknown>> = (left, right) => left.length - right.length;
export const compareBool: Comparator<boolean> = (left, right) => {
  if (left < right)
    return -1;
  if (left > right)
    return 1;
  return 0;
};
export const compareNumber: Comparator<number> = (left, right) => left - right;
export const compareReverse = <T>(compare: Comparator<T>) => (left: T, right: T) => compare(right, left);
export const compareField = <T, K extends keyof T>(field: K, compare: Comparator<T[K]>) => (left: T, right: T) => compare(left[field], right[field]);
/**
 * Combine multiple comparators.
 *
 * @example
 * // first by id, then by salary
 * const compareUser = compareCombine<User>(
 *  compareField('id', compareString),
 *  compareField('salary', compareReverse(compareNumber)),
 * );
 *
 * items.sort(compareUser);
 */
export function compareCombine<T>(...comparators: Comparator<T>[]) {
  return (left: T, right: T) => {
    for (let x = 0; x < comparators.length; x += 1) {
      const compare = comparators[x] as Comparator<T>;
      const res = compare(left, right);
      if (res)
        return res;
    }
    return 0;
  };
}
/**
 * Returns `true` if the provided predicate function returns `true` for all elements in a collection, `false` otherwise.
 */
export function match<C, T>(...cases: [C, T][]) {
  const occasion = cases.find(([condition]) => Boolean(condition));
  if (!occasion)
    throw new Error('No default condition');

  return occasion[1];
}
/**
 * Pipe function
 *
 * @example
 * const func1 = (number: number) => number - 2;
 * const func2 = (number: number) => number + 2;
 * const func3 = (number: number) => number * 2;
 *
 * const pipedFunction = pipe(func1, func2, func3);
 *
 * pipedFunction(5) // (((5 * 2) + 2) - 1)
 */
export function pipe<T extends unknown[], U>(fn1: (...args: T) => U,
  ...fns: Array<(a: U) => U>) {
  const piped = fns.reduce((prevFn, nextFn) => (value: U) => nextFn(prevFn(value)), value => value);
  return (...args: T) => piped(fn1(...args));
}
