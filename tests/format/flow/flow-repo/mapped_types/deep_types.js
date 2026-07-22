type DeepPartialState<T> =
  // Leave primitives alone
  T extends ?(number | string | boolean)
    ? T
    : Readonly<{
      [K in keyof T]: DeepPartialState<Partial<T>[K]>,
    }>

{
  declare const a: DeepPartialState<number>;
  a as number; // ok
  a as empty; // error: number ~> empty

  declare const b: DeepPartialState<{foo: {bar: {baz: string}}}>;
  b as {readonly foo?: {readonly bar?: {readonly baz?: string}}};
  b as {readonly foo: {readonly bar?: {readonly baz?: string}}}; // error: foo not optional
  b as {readonly foo?: {readonly bar: {readonly baz?: string}}}; // error: bar not optional
  b as {readonly foo?: {readonly bar?: {readonly baz: string}}}; // error: baz not optional
}

type DeepReadOnly<T> =
  T extends ReadonlyArray<infer V> ? ReadonlyArray<DeepReadOnly<V>> :
  T extends {...} ? {readonly [K in keyof T]: DeepReadOnly<T[K]>} : T;

{
  const obj: DeepReadOnly<{
    arr: Array<{value: string, ...}>,
    nested: {
      value: string,
      doubleNested: {value: string, ...},
      ...
    },
    ...
  }> = {
    arr: [{value: 'a'}, {value: 'b'}],
    nested: {
      value: 'nested value',
      doubleNested: {
        value: 'double nested value',
      },
    },
    value: 'top value',
  };
  obj as empty; // error

  obj.arr.push({value: 'updated value'}); // error: Cannot mutate arrays.
  obj.arr[0].value = 'updated value'; // error: Cannot mutate objects in arrays.
  obj.arr = []; // error: Cannot change top-level values.
  obj.nested = obj.nested; // error: Cannot change top-level values.
  obj.nested.value = 'updated value'; // error: Cannot change nested values.
  obj.nested.doubleNested = obj.nested.doubleNested; // error: Cannot change nested values.
  obj.nested.doubleNested.value = 'updated value'; // error: Cannot change nested values.

  const arr: DeepReadOnly<Array<string>> = ['hello', 'world'];
  arr.push('goodbye'); // error: Cannot mutate arrays.
  arr[0] = 'goodbye'; // error: Cannot mutate values in arrays.
}
