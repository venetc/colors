export function isEmptyArray(value: unknown) {
  return Array.isArray(value) && value.length === 0;
}
export function isObject<T = unknown>(value: unknown): value is Record<string, T> {
  const type = typeof value;
  return value != null && (type === 'object' || type === 'function') && !Array.isArray(value);
}
export function isEmptyObject(value: object) {
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
