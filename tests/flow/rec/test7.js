/**
 * @flow
 */

declare class ImmutableSet<T> {
  toArray(): T[];
}

declare function foo(): ImmutableSet<string>;

function bar() {
  let value;

  if (true) {
    value = foo();
  }

  if (value instanceof ImmutableSet) {
    value = value.toArray();
  }
}
