{
  // Basic functionality test
  type Keys = 'foo' | 'bar';
  type Mapped = {[key in Keys]: number};

  declare const mapped: Mapped;
  mapped.foo as number; // OK!
  mapped.foo = 3; // OK!


  mapped as empty; // ERROR!
  mapped as {foo: empty, bar: empty}; // ERROR 2x
  mapped as {foo: number, bar: number}; // OK!
}

{
  // Leftover types are converted to indexers
  type WithLeftovers = {[key in 'foo' | number]: number};
  declare const withLeftovers: WithLeftovers;
  withLeftovers as {[number]: number, foo: number}; // OK!
  withLeftovers as {[number]: string, foo: string}; // ERROR 2x
}

{
  // Key types must be string | number | symbol, otherwise error on the
  // definition.
  // TS Reference: https://www.typescriptlang.org/play?ts=5.0.4#code/C4TwDgpgBAsghmSATKBeKBvA2gawiKASwDsoAjAewoBsI5iBdALimIFcBbMiAJwF8A3EA
  type BadKeys = {[key in boolean]: number}; // ERROR!
  declare const badKeys: BadKeys;
  badKeys as any;
}

{
  // Tests using mapped types in output positions for implicit instantiation
  declare function keyMirror<const T>(...x: ReadonlyArray<T>): {[key in T]: key};

  let keyMirroredObject = keyMirror('foo', 'bar', 'baz');
  keyMirroredObject as {foo: 'foo', bar: 'bar', baz: 'baz'};

  keyMirroredObject as {foo: 'bar', bar: 'baz', baz: 'foo'}; // ERROR x3
}

{
  // Tests using mapped types in input positions for implicit instantiation
  declare function ObjWithKeys<const T>(x: {[key in T]: number}, ...y: ReadonlyArray<T>): {[key in T]: number};
  const noContext = ObjWithKeys({foo: 3, bar: 3}, 'foo', 'bar'); // OK!
  noContext as {foo: number, bar: number}; // OK!
  noContext as {foo: empty, bar: empty, baz: number}; // ERROR 3x
  const withReturnAnnot: {foo: number, bar: number} = ObjWithKeys({foo: 3, bar: 3}, 'foo', 'bar'); // OK!
}
