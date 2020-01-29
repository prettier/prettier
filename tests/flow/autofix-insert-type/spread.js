// @flow

declare opaque type O;
class C { f: O; }
class D { g: O; }

() => { declare var x: {w: O, ...{| x: O, y: O |}, z: O}; return x; };
() => { declare var x: {|w: O, ...{| x: O, y: O |}, z: O|}; return x; };
() => { declare var x: {...C, o: O}; return x; };
() => { declare var x: {...C} & {...D}; return x; };
<T: {||}, S: {| f: O |}>() => { declare var x: {...T, ...S, o: O}; return x; };
<T: {||}>() => { declare var x: {...T, o: O}; return x; };
