//@flow

type Data = {| x: number |}

declare function foo(data: Data): void;

const o = {
  fun: foo,
}
/*
The error position for this one is bad,
as it points to line 5.
*/
function test1(b: boolean) {
  var data = { x: 0 };
  if (b) data = { z: 0 };
  o['fun'](data);
}
/*The error position for this one is ok.*/
function test2(b: boolean) {
  var data = { z: 0 };
  o['fun'](data);
}
