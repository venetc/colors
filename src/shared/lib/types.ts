type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, [T, ...R]>;
export type Tuple<T, N extends number> = N extends N ? (number extends N ? T[] : _TupleOf<T, N, []>) : never;

/**
 * Given two object types A and B, return a type with all the properties of A that aren't also
 * properties of B, and all the properties of B.
 *
 * Useful when we have a component that spreads a "rest" of its props on a subcomponent:
 *
 * ```ts
 * interface OwnProps {
 *  foo: string
 * }
 *
 * type MyComponentProps = Merge<SubcomponentProps, OwnProps>
 * const MyComponent = ({foo, ...rest}: MyComponentProps) => {
 *   // ...
 *   return <SubComponent {...rest} />
 * }
 * ```
 */
export type Merge<A = Record<string, unknown>, B = Record<string, unknown>> = Omit<A, keyof B> & B;
/**
 Matches any [primitive value](https://developer.mozilla.org/en-US/docs/Glossary/Primitive).
 */
export type Primitive = null | undefined | string | number | boolean | symbol | bigint;
/**
 Allows creating a union type by combining primitive types and literal types without sacrificing auto-completion in IDEs for the literal type part of the union.
 Currently, when a union type of a primitive type is combined with literal types, TypeScript loses all information about the combined literals. Thus, when such type is used in an IDE with autocompletion, no suggestions are made for the declared literals.
 This type is a workaround for [Microsoft/TypeScript#29729](https://github.com/Microsoft/TypeScript/issues/29729). It will be removed as soon as it's not needed anymore.

 @example
 ```
 import {LiteralUnion} from 'type-fest';

 // Before
 type Pet = 'dog' | 'cat' | string;
 const pet: Pet = '';

 // Start typing in your TypeScript-enabled IDE.
 // You **will not** get auto-completion for `dog` and `cat` literals.

 // After

 type Pet2 = LiteralUnion<'dog' | 'cat', string>;

 const pet: Pet2 = '';
 // You **will** get auto-completion for `dog` and `cat` literals.
 ```
 */
export type LiteralUnion<LiteralType, BaseType extends Primitive> = LiteralType | (BaseType & Record<never, never>);

export type RequireKeys<Type, Keys extends keyof Type> = Omit<Type, Keys> & Required<Pick<Type, Keys>>;

export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;
