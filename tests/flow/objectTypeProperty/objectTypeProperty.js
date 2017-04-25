/* @flow */

declare var BAZ: {stuff?: (x: number) => void} | void;

declare class Foo<T> {
  constructor(): void;
  foo: () => void;
}

let x: { x?: number }

type T = {
  get goodGetterWithAnnotation(): number,
  set goodSetterWithAnnotation(x: number): void,
}
