// @flow

type O1 = {...mixed};
declare var o1: O1;
(o1.someProp: empty); // Error someProp does not exist

type O2 = {|...mixed|};
declare var o2: O2;
(o2.someProp: empty); // Error someProp does not exist

type O3 = {...mixed, ...{|a: number, b?: number|}};
declare var o3: O3;
(o3.a: empty); // Error: number ~> empty
(o3.b: empty); // Error: mixed ~> empty, number ~> empty, and undefined ~> empty
(o3.c: empty); // Error c does not exist

function fn<O>(obj: {...O}) {
  (obj.someProp: empty); // Error someProp does not exist
}
