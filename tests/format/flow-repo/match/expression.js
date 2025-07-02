// Type of body and abnormal handling
{
  declare const x: empty;
  const out = match (x) {};

  out as empty; // OK
}

declare const x: 1 | 2;

{
  const out = match (x) {
    1 => true,
    2 => false,
  };

  out as boolean; // OK
  out as empty; // ERROR
}

{
  const out = match (x) {
    1 => true,
    2 => 's',
  };
  out as boolean | string; // OK
  out as empty; // ERROR
}

declare function invariant(boolean): empty;

{
  const out = match (x) {
    1 => true,
    2 => invariant(false),
  };
  out as boolean; // OK
  out as empty; // ERROR
}

function f1() {
  const out = match (x) {
    1 => invariant(false),
    2 => invariant(false),
  };
  out; // ERROR: unreachable
}

// Throws in guards
function f2() {
  const out = match (x) {
    1 if (invariant(false)) => true,
    _ => 's',
  };
  out as string; // OK
  out as empty; // ERROR
}

// Nested matches
{
  const out = match (x) {
    1 => 1,
    const a => match (a) {
      const a => a,
    },
  };

  out as number; // OK
}

// Guards can refine values which are not the argument
{
  declare const y: number | string;

  const out = match (x) {
    1 if (typeof y === 'number') => y as number, // OK
    const a if (a === 1) => a as 1,
    _ => 0,
  };
}

// Case body provider and refinement analysis
{
  let target;
  const out = match (x) {
    1 => target = "foo",
    2 => target = true,
  };

  target as string | boolean; // OK
}
{
  let target;
  const out = match (x) {
    const a => target = "foo" as const,
  };
  a; // ERROR

  target as "foo"; // OK
}
{
  declare const x: [number] | number;
  let target = null;
  const out = match (x) {
    [const a] => target = "foo",
    const a => target = true,
  };
  a; // ERROR

  target as string | boolean; // OK
}
{
  let target;
  const out = match (x) {
    1 => target = "foo",
    2 => invariant(false),
  };

  target as string; // OK
}
{
  declare const o: {prop: number};
  const out = match (x) {
    1 => o.prop = 1,
    2 => o.prop = 2,
  };

  o.prop as 1 | 2; // OK
}
{
  const a = [];
  const out = match (x) {
    1 => a.push(1),
    2 => a.push(2),
  };

  a as Array<number>; // OK
}

// Natural inference hint
{
  const out: 'a' | 'b' = match (x) {
    1 => 'b', // OK
    2 => 'xxx', // ERROR: 'xxx' is not a subtype of 'a' | 'b'
  };
}
{
  declare const dict: {['a' | 'b']: number};
  dict[match (x) {
    1 => 'b', // OK
    2 => 'xxx', // ERROR: 'xxx' is not a subtype of 'a' | 'b'
  }];
}
