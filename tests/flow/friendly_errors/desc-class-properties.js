/**
 * @format
 * @flow
 */

declare class Y {
  a: string;
}

class X extends Y {
  b: string;
  // prettier-ignore
  #c: string;

  foo() {
    (this.a: number); // Error: string ~> number
    (super.a: number); // Error: string ~> number
    (this.b: number); // Error: string ~> number
    (this.#c: number); // Error: string ~> number
  }
}
