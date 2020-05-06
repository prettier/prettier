// @flow

type A = { x: number };
type B = $Exact<A>;
//   ^
declare var a: $Exact<A>;
//          ^
declare var b: $Exact<B>;
//          ^
declare var c: $Exact<{ p: number }>;
//          ^

function foo<X>(x: $Exact<X>) {
//              ^
  var y: $Exact<X>;
//    ^
}

declare var e: $Exact<$Exact<A>>;
//          ^

class C {}
declare var f: $Exact<Class<C>>;
//          ^

type P<X> = $Exact<{ m: (x: X) => void}>;
//   ^
type Q<X> = $Exact<P<X>>;
//   ^
