// @flow

// TypeScript examples:
type TypeName<T> =
  T extends string ? "string"
  : T extends number ? "number"
  : T extends boolean ? "boolean"
  : T extends undefined ? "undefined"
  : T extends Function ? "function"
  : "object";

type Unpacked<T> =
  T extends (infer U)[] ? U
  : T extends (...args: any[]) => infer U ?
    SomeReallyLongThingThatBreaksTheLine<U>
  : T extends Promise<infer U> ? U
  : T;
