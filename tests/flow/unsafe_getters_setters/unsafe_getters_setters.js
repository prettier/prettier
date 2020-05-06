/**
 * @flow strict
 */

var f = {
  get a() { return 4; },
  set b(x: number) { this.c = x; },
  c: 10,
};

class Bar {
  get a() { return 4; }
  set b(x: number) { this.c = x; }
  c: number;
}

type T = {
  get a(): number,
  set b(x: number): void,
  c: 10,
}

declare class Foo {
  get a(): number;
  set b(x: number): void;
  c: 10;
}

interface FooBar {
  a(): string;
  get b(): number;
  set c(x: number): void;
}
