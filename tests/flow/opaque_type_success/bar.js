// @flow
import foo from "./foo";
opaque type T = number;
export function f(x: T) : number {
  return foo(x); // should be OK
}
