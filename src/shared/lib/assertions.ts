export function isEmptyArray(value: unknown) {
  return Array.isArray(value) && value.length === 0;
}

export const isObject = (val: unknown): val is object => toString.call(val) === '[object Object]';

export function isEmptyObject(value: object): value is Record<string, never> {
  return isObject(value) && Object.keys(value).length === 0;
}

export function isEmpty(value: unknown) {
  if (value == null || value === '')
    return true;
  if (Array.isArray(value))
    return isEmptyArray(value);
  if (isObject(value))
    return isEmptyObject(value);
  return false;
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}
