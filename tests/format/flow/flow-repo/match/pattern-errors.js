// Match expressions only allow `const` bindings
{
  declare const x: 0 | 1 | [2] | {a: 3, b: 4};

  const e1 = match (x) {
     [...let a] => 0, // ERROR
     {let a, ...let b} => 0, // ERROR
     0 as let a => 0, // ERROR
     let a => 0, // ERROR
  };

  const e2 = match (x) {
     [...var a] => 0, // ERROR
     {var a, ...var b} => 0, // ERROR
     0 as var a => 0, // ERROR
     var a => 0, // ERROR
  };
}

// Invalid numeric property
{
  declare const x: {1: true};

  const e1 = match (x) {
    {1.1: _} => 0, // ERROR
    _ => 0,
  };
}

// Unary pattern on `0` banned
{
  declare const x: 0;

  const e1 = match (x) {
    -0 => true, // ERROR
    +0 => true, // ERROR
    0 => true, // OK
  };
}

// Unary `+` on bigint banned
{
  declare const x: 1n;

  const e1 = match (x) {
    +1n => true, // ERROR
    1n => true, // OK
  };
}

// Duplicate object keys banned
{
  declare const x: {foo: boolean};

  const e1 = match (x) {
    {foo: true, foo: false} => 0, // ERROR
    _ => 0,
  };

  const e2 = match (x) {
    {foo: true, const foo} => 0, // ERROR
    _ => 0,
  };

  const e3 = match (x) {
    {foo: true, 'foo': false} => 0, // ERROR
    _ => 0,
  };
}

// Duplicate binding names
{
  declare const x: [boolean, boolean];

  const e1 = match (x) {
    [const a, true as a] => 0, // ERROR
    [const a, const a] => 0, // ERROR
    _ => 0,
  };

  const e2 = match (x) {
    [const a, true as const a] => 0, // ERROR
    [const a, ...const a] => 0, // ERROR
    _ => 0,
  };
}
{
  declare const x: {a: boolean, b: boolean};
  const e1 = match (x) {
    {const a, b: true as a} => 0, // ERROR
    {const a, ...const a} => 0, // ERROR
    _ => 0,
  };
}

// Bindings in 'or' patterns are not yet supported
{
  declare const x: [boolean] | [string];

  const e1 = match (x) {
    [true as a] | ['s'] => 0, // ERROR
    [false as const a] | ['s'] => 0, // ERROR
    _ => 0,
  };

  const e2 = match (x) {
    [true as const a] | ['s'] => 0, // ERROR
    ['t'] | [...const a] => 0, // ERROR
    _ => 0,
  };
}
{
  declare const x: {a: boolean} | {a: string};

  const e1 = match (x) {
    {a: true as a} | {a: 's'} => 0, // ERROR
    {a: false as const a} | {a: 's'} => 0, // ERROR
    _ => 0,
  };
}

// As pattern on binding pattern
{
  declare const x: [boolean];

  const e1 = match (x) {
    [const a as b] => 0, // ERROR
    _ => 0,
  };

  const e2 = match (x) {
    const a as const b => 0, // ERROR
  };
}

// Reference before declaration
{
  declare const x: [number, number];

  const out = match (x) {
    [a, const a] => a, // ERROR: reference before declaration
    _ => 0,
  };
}
{
  declare const x: [number, {foo: number}];

  const out = match (x) {
    [a.foo, const a] => a, // ERROR: reference before declaration
    _ => 0,
  };
}

// Reference binding introduced in same pattern
{
  declare const x: [number, number];

  const out = match (x) {
    [const a, a] => a, // ERROR
    _ => 0,
  };
}
{
  declare const x: [{foo: number}, number];

  const out = match (x) {
    [const a, a.foo] => a, // ERROR
    _ => 0,
  };
}

// // Invalid object property shorthand
// {
//   declare const x: {foo: 1, bar: boolean};

//   const out = match (x) {
//     {foo} => 0, // ERROR
//     {foo, bar: true} => 0, // ERROR
//     _ => 0,
//   };
// }

// BigInt property usage
{
  declare const x: mixed;

  const out = match (x) {
    {1n: 1, ...} => 0, // ERROR
    _ => 0,
  };
}
