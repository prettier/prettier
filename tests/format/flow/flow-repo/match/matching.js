// Primitive value union
{
  declare const x: 1 | -2 | 3n | 's' | false | null;

  const e1 = match (x) {
    1 => 0,
    -2 => 0,
    3n => 0,
    's' => 0,
    false => 0,
    null => 0,
  };

  const e2 = match (x) { // ERROR: not all members checked
    1 => 0,
    false => 0,
    3n => 0,
    null => 0,
  };
}

// Identifier patterns
{
  declare const x: 1 | 2;

  declare const one: 1;
  declare const two: 2;

  const e1 = match (x) {
    one => 0,
    two => 0,
  };

  const e2 = match (x) { // ERROR: `2` not checked
    one => 0,
  };
}

// `undefined`
{
  declare const x: 1 | void;

  const e1 = match (x) {
    1 => 0,
    undefined => 0,
  };

  const e2 = match (x) { // ERROR: `undefined` not checked
    1 => 0,
  };
}

// Maybe types
{
  declare const x: ?1;

  const e1 = match (x) {
    1 => 0,
    undefined => 0,
    null => 0,
  };

  const e2 = match (x) { // ERROR: `null` and `undefined` not checked
    1 => 0,
  };
}

// Member patterns
{
  declare const x: 1 | 2;

  declare const o: {
    one: 1,
    two: 2,
  };

  const e1 = match (x) {
    o.one => 0,
    o.two => 0,
  };

  const e2 = match (x) { // ERROR: `2` not checked
    o.one => 0,
  };
}

// `as` pattern refines using its pattern
{
  declare const x: 1 | 2;

  const e1 = match (x) {
    1 as a => a as 1, // OK
    2 as a => a as 2, // OK
  };
}
{
  declare const x: {type: 'foo', value: 1}
                 | {type: 'bar', value: 2};

  // Nested `as` pattern
  const e1 = match (x) {
    {type: 'foo' as a, const value} => (a as 'foo', value as 1), // OK
    {type: 'bar' as a, const value} => (a as 'bar', value as 2), // OK
  };
}

// Top level binding and wildcard
{
  declare const x: 1 | 2;

  const e1 = match (x) {
    1 => 0,
    const a => a as 2, // OK
  };

  const e2 = match (x) {
    1 => 0,
    _ => 0, // OK
  };
}

// Non-ident/member argument still works
{
  declare const f: () => 1 | 2;

  const e1 = match (f()) {
    1 => 0,
    2 => 0,
  };

  const e2 = match (f()) { // ERROR: `2` not checked
    1 => 0,
  };
}

// Or pattern
{
  declare const x: 1 | 2 | 3;

  const e1 = match (x) {
    1 | 2 | 3 => true,
  };

  const e2 = match (x) { // ERROR: `3` not checked
    1 | 2 => true,
  };
}

// Patterns with guard could match or not match
{
  declare const x: 1 | 2;

  declare function f(): boolean;

  const e1 = match (x) { // ERROR: `2` not checked
    1 => 0,
    2 if (f()) => 0,
  };

  const e2 = match (x) {
    1 => 0,
    2 if (f()) => 0,
    2 => 0,
  };
}

// Property exists
{
  declare const x: {foo: void, a: 0} | {bar: void, a: 1};

  const e1 = match (x) {
    {foo: _, const a} => a as 0, // OK
    {bar: _, const a} => a as 1, // OK
  };
}
{
  declare const x:
    | {foo: void, a: 0}
    | {bar: void, a: 1}
    | {baz: void, a: 2}
    | {zap: void, a: 3};

  declare const u: void;
  declare const o: {u: void};

  const e1 = match (x) {
    {foo: u, const a} => a as 0, // OK
    {bar: o.u, const a} => a as 1, // OK
    {baz: undefined as v, const a} => a as 2, // OK
    {zap: u, const a} => a as 3, // OK
  };
}

// Disjoint object union
{
  declare const x: {type: 'foo', val: number}
                 | {type: 'bar', val: string}
                 | {type: 'baz', val: boolean};

  const e1 = match (x) {
    {type: 'foo', val: const a} => a as number, // OK
    {type: 'bar', val: const a} => a as string, // OK
    {type: 'baz', val: const a} => a as boolean, // OK
  };

  const e2 = match (x) { // ERROR: `type: 'baz'` not checked
    {type: 'foo', val: const a} => a as number, // OK
    {type: 'bar', val: const a} => a as string, // OK
  };

  // Using idents as pattern
  declare const foo: 'foo';
  declare const bar: 'bar';
  declare const baz: 'baz';
  const e3 = match (x) {
    {type: foo, val: const a} => a as number, // OK
    {type: bar, val: const a} => a as string, // OK
    {type: baz, val: const a} => a as boolean, // OK
  };

  // Using members as pattern
  declare const o: {
    foo: 'foo',
    bar: 'bar',
    baz: 'baz',
  };
  const e4 = match (x) {
    {type: o.foo, val: const a} => a as number, // OK
    {type: o.bar, val: const a} => a as string, // OK
    {type: o.baz, val: const a} => a as boolean, // OK
  };
}

// Disjoint object union with multiple pivot props
{
  declare const x: {type: 'foo', val: number}
                 | {type: 'bar', n: 1, val: string}
                 | {type: 'bar', n: 2, val: boolean};

  const e1 = match (x) {
    {type: 'foo', val: const a} => a as number, // OK
    {type: 'bar', val: const a, ...} => a as string | boolean, // OK
  };

  const e2 = match (x) {
    {type: 'foo', val: const a} => a as number, // OK
    {type: 'bar', n: 1, val: const a} => a as string, // OK
    {type: 'bar', n: 2, val: const a} => a as boolean, // OK
  };

  const e3 = match (x) { // ERROR: `type: 'bar', n: 2` not checked
    {type: 'foo', val: const a} => a as number, // OK
    {type: 'bar', n: 1, val: const a} => a as string, // OK
  };
}

// Combo union of object with sentinel property and primitive value
{
  declare const x: null | {type: 'bar', val: number};

  const e1 = match (x) {
    {type: 'bar', val: const a} => a as number, // OK
    null => 0,
  };
}

// Or pattern: objects
{
  declare const x: {type: 'foo', val: number}
                 | {type: 'bar', val: string}
                 | {type: 'baz', val: boolean};

  const e1 = match (x) {
    {type: 'foo', ...} | {type: 'bar', ...} | {type: 'baz', ...} => 0,
  };

  const e2 = match (x) { // ERROR: `type: 'bar'` not checked
    {type: 'foo', ...} | {type: 'baz', ...} => 0,
  };
}

// Disjoint tuple union
{
  declare const x: ['foo', number]
                 | ['bar', string]
                 | ['baz', boolean];

  const e1 = match (x) {
    ['foo', const a] => a as number, // OK
    ['bar', const a] => a as string, // OK
    ['baz', const a] => a as boolean, // OK
  };

  const e2 = match (x) { // ERROR: `'baz'` element not checked
    ['foo', const a] => a as number, // OK
    ['bar', const a] => a as string, // OK
  };

  // Using idents as pattern
  declare const foo: 'foo';
  declare const bar: 'bar';
  declare const baz: 'baz';
  const e3 = match (x) {
    [foo, const a] => a as number, // OK
    [bar, const a] => a as string, // OK
    [baz, const a] => a as boolean, // OK
  };
}

// Combo union of tuples with sentinel property and primitive value
{
  declare const x: null | ['bar', number] | ['foo', string];

  const e1 = match (x) {
    ['bar', const a] => a as number, // OK
    ['foo', const a] => a as string, // OK
    null => 0,
  };
}

// Tuple length refinements
{
  declare const x: [number]
                 | [string, string]
                 | [boolean, boolean, boolean];

  const e1 = match (x) {
    [const a] => a as number, // OK
    [const a, _] => a as string, // OK
    [const a, _, _] => a as empty, // ERROR: `boolean` is not `empty`
  };

  const e2 = match (x) {
    [...] => 0, // OK: matches all
  }

  const e3 = match (x) {
    [const a, _, ...] => a as string | boolean, // OK
    [const a] => a as number, // OK
  }
}
{
  declare const x: [number] | Array<string>;

  const e1 = match (x) {
    [] => 0, // OK
    [const a] => a as string, // ERROR: `number` is not `string`
    [const a, _] => a as string, // OK
    const d => d as Array<string>, // OK: tuple checked, but array could have other lengths
  };

  const e2 = match (x) {
    [...] => 0, // OK: matches all
  }
}

// Optional tuple elements
{
  declare const x: [a: 0, b?: 1, c?: 2];

  const e1 = match (x) {
    [_, ...] => 0,
  };

  const e2 = match (x) { // ERROR: does not match all possibilities
    [_, _, ...] => 0,
  };

  const e3 = match (x) { // ERROR: does not match all possibilities
    [_] => 0,
  };

  const e4 = match (x) { // ERROR: does not match all possibilities
    [_, _, _] => 0,
  };
}

// Inexact tuple types
{
  declare const x: [a: 0, ...];

  const e1 = match (x) {
    [_, ...] => 0,
  };

  const e2 = match (x) { // ERROR: does not match all elements
    [_] => 0,
  };
}

// Exhaustive checking error points to definition
{
  type T = {foo: 1} | {foo: 2};
  declare const x: T;

  const e1 = match (x) {
    {foo: 1} => 0,
  };
}
