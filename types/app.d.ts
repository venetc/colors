declare const _brand: unique symbol;

declare global {
  export type Brand<K, T> = K & { [_brand]: T };
  export type Id = string;
  export type Hex = string;
}

export {};
