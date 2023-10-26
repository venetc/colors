/**
 * Generate random number in interval [min, max].
 */
export function randomInt(min: number, max: number) {
  const minValue = Math.ceil(min);
  const maxValue = Math.floor(max);
  return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
}
/**
 * Calculates a number between two numbers at a specific decimal midpoint.
 *
 * @param {number} from first value
 * @param {number} to second value
 * @param {number} point decimal midpoint
 * @returns {number} interpolated value
 */
export const lerp = (from: number, to: number, point: number) => from * (1 - point) + to * point;
/**
 * Returns a number whose value is limited to the given range.
 *
 * @param {number} value The value to be clamped
 * @param {number} min The lower boundary of the output range
 * @param {number} max The upper boundary of the output range
 * @returns {number} A number in the range [min, max]
 */
export function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(min, value), max);
}
/**
 * Calculates a decimal midpoint between two numbers.
 *
 * @param {number} from first value
 * @param {number} to second value
 * @param {number} point value between two numbers
 * @returns {number} decimal midpoint
 */
export const inverseLerp = (from: number, to: number, point: number) => clamp((point - from) / (to - from));
/**
 * Convert a value to percentage based on lower and upper bound values
 *
 * @param value the value in number
 * @param min the minimum value
 * @param max the maximum value
 */
export function valueToPercent(value: number, min: number, max: number) {
  return (value - min) * 100 / (max - min);
}
/**
 * Calculate the value based on percentage, lower and upper bound values
 *
 * @param percent the percent value in decimals (e.g 0.6, 0.3)
 * @param min the minimum value
 * @param max the maximum value
 */
export function percentToValue(percent: number, min: number, max: number) {
  return (max - min) * percent + min;
}
