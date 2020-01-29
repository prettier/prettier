/**
 * @format
 * @flow
 */

(() => {
  return 42; // Error: We should point to 42.
}: () => string);

const f = () => {
  return 42;
};
(f: () => string); // Error: We should point to f.

declare function myFn1(): number;
declare function myFn2(x: number): void;

({
  fn1: myFn1, // Error: We should point to just the `myFn1` property.
}: {
  fn1: () => void,
});

({
  fn2: myFn2, // Error: We should point to just the `myFn1` property.
}: {
  fn2: (x: string) => void,
});

({
  fn2: myFn2, // Error: We should point to just the `myFn1` property.
}: {
  fn2: () => void,
});
