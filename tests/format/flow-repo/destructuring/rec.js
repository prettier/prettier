// @flow

// Make sure that destructuring doesn't cause infinite loops when combined with
// funny doses of repositioning

let foo = (i: number) => [i];

const bar = (i: number) => {
  [i] = foo(i);
  return [i];
};

foo = (i: number) => {
  return bar(i);
};

// Also make sure that the following doesn't loop

declare var o: empty;
var { x: o } = o;

// this also must not loop

declare var _x:  {};

let x = _x;

function baz () {
    const {...y} = x;

    x = y;
}
