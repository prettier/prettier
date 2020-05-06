// @flow

type NumType = Array<{|+nums: number|}>;   // TODO
type ReadOnlyNumType = $ReadOnlyArray<{|+nums: number|}>;

function foo(num: NumType) {
  num[0];
}

function bar(num: ReadOnlyNumType) {
  num[0];
}

function baz(arr: Array<string>) {
  arr;
}

function bliffl(arr: Array<?string>) {
  arr;
}

function blah(arr: Array<string | number>) {
  arr;
}
