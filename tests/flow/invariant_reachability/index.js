/* @flow */

declare function invariant(): empty; // raises

function foo(c: bool): string {
  const y = c ? 5 : invariant();
  return "default string";
}


function foo(c: bool): string {
  c ? 5 : invariant(false);
  return "default string";
}


function foo(c: bool): string {
  const y = c ? invariant() : invariant(false);
  return "default string";
}


function foo(c: bool): string {
  const y = false ? 5 : invariant(false);
  return "default string";
}


function foo(c: bool): string {
  invariant()
  return "default string";
}


function foo(c: bool): string {
  invariant(false)
  return "default string";
}

function foo(c: bool): string {
  invariant(c)
  return "default string";
}

function foo(c: bool):string {
  return c ? 'a' : invariant();
}

function foo(c: bool):string {
  return c ? 1 : invariant();
}


function foo(c: bool):string {
  return c ? invariant() : invariant();
}
