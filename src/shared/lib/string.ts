import { isObject } from './assertions';

/**
 * Return a slugified copy of a string.
 *
 * @param {string} str The string to be slugified
 * @return {string} The slugified string.
 */
export function toSlug(str: string) {
  let s = str;
  if (!s)
    return '';

  s = s.toLowerCase().trim();
  s = s.replace(/ & /g, ' and ');
  s = s.replace(/[ ]+/g, '-');
  s = s.replace(/[-]+/g, '-');
  s = s.replace(/[^a-z0-9-]+/g, '');
  return s;
}
/**
 * It takes a string, finds any capital letters that are preceded by a lowercase letter, and replaces
 * them with a hyphen and the capital letter
 * @param {string} str - string
 */
export const camelToKebab = (str: string) => str.replace(/[\w]([A-Z])/g, group => `${(group[0] as string)}-${(group[1] as string)}`).toLowerCase();
/**
 * It takes a string and replaces any capital letter that is preceded by a lowercase letter with the
 * lowercase letter followed by an underscore and the capital letter
 * @param {string} str - string - The string to convert
 */
export const camelToSnake = (str: string) => str.replace(/[\w]([A-Z])/g, group => `${(group[0] as string)}_${(group[1] as string)}`).toLowerCase();
/**
 * "Replace all instances of a dash followed by a word character with the word character capitalized."
 * @param {string} str - The string to convert.
 */
export const kebabToCamel = (str: string) => str.replace(/(-\w)/g, group => (group[1] as string).toUpperCase());
/**
 * Finds all the underscores followed by a letter, and replaces them with the letter
 * capitalized
 *
 * @param {string} str - string - The string to convert
 */
export const snakeToCamel = (str: string) => str.replace(/(_\w)/g, group => (group[1] as string).toUpperCase());
/**
 * Capitalize the first letter of a string.
 * @param {string} str - string - the string to capitalize
 */
export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
/**
 * Return the first character of the string in lowercase, and the rest of the string as is.
 * @param {string} str - The string to uncapitalize.
 */
export const uncapitalize = (str: string) => str.charAt(0).toLowerCase() + str.slice(1);
/**
 * Replace all occurrences in a string.
 *
 * Meant to be used with string that contain "dynamic" data, such as "Hello {name}",
 * where "name" is meant to be a variable
 *
 * @example replaceAllOccurrences('Hello {name}', { name: 'world' }) => "Hello world"
 */
export function replaceAllOccurrences(initialString: string, variables: Record<string, string>, prefix = '{', suffix = '}') {
  if (initialString.length && isObject(variables) && Object.keys(variables).length) {
    let replacedString = initialString;
    Object.entries(variables).forEach(([key, replacement]) => {
      const needle = `${prefix}${key}${suffix}`;
      const re = new RegExp(needle, 'gi');
      replacedString = replacedString.replace(re, replacement);
    });
    return replacedString;
  }
  return initialString;
}
export function generateUUID() {
  let ms = new Date().getTime();

  ms += performance.now();

  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

  const replacer = (char: string) => {
    const r = (ms + Math.random() * 16) % 16 | 0;

    ms = Math.floor(ms / 16);

    const result = char === 'x'
      ? r
      : (r & 0x3 | 0x8);

    return result.toString(16);
  };

  return template.replace(/[xy]/g, replacer);
}
export function formatStringToLinks(rawString: string) {
  const array = rawString.match(/(https?:\/\/[\S\s]+?\.(?:png|jpe?g))/gi);

  return array ?? [];
}
export function ellipsisString(s: string, max = 42) {
  if (s.length <= max) return s;
  return `${s.slice(0, (max / 2 + 4))}...${s.slice(s.length - (max / 2 - 4), s.length)}`;
}
