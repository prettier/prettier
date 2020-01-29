/* @flow */

export function foo() {

}

export default class Bar {}

foo();

// This foo shadows the other one: it is not the same variable
function bar(foo) {
  console.log(foo);
}

export class Foo {
  foo(): void {}
  bar(): void {
    this.foo();
  }
}

new Foo().bar();

new Bar();

export const baz = 1, qux = 2;
