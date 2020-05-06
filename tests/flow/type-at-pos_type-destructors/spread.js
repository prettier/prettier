// @flow

declare opaque type O;
declare var o: O;
type C = {| f: O; |}
class P<X> { p: X }
class D { g: O; }
type Ctor = Class<D>;

// Concrete - should be evaluated before normalization

type EObj2  = {|w: O, ...{| x: O, y: O |}, z: O|};
//   ^
type C1     = {...C, o: O};
//   ^
type C2     = {o: O, ...C};
//   ^
type EC1    = {|...$Exact<C>, o: O|};
//   ^
type EC2    = {|o: O, ...C|};
//   ^
type Ctor1  = {...Ctor, o: O};
//   ^
type P1<T>  = {...P<T>, o: O};
//   ^
type Rec    = {o: O, ...Rec};  // Rec = empty
//   ^

// Unevaluated
type B1<T: {}, S: {}> = {...T, ...S, o: O};
//   ^
type B2<T: {}> = {...T, o: O};
//   ^
type B3<T: {}> = {o: O, ...T};
//   ^
type B4<T: {}> = {o: O, ...T, oo: O};
//   ^
type B5<T: {}> = {u: O, ...{ v: O, w: T }, x: O, ...T, y: O};
//   ^
type EB1<T: {}, S: {}> = {|...T, ...S, o: O|};
//   ^
type EB2<T: {}> = {|...T, o: O|};
//   ^
type EB3<T: {}> = {|o: O, ...T|};
//   ^
type EB4<T: {}> = {|o: O, ...T, oo: O|};
//   ^
type EB5<T: {}> = {|u: O, ...{ v: O, w: T }, x: O, ...T, y: O|};
//   ^
type PTA1<T: {}> = {...B2<T>, ...T};
//   ^ --expand-type-aliases
type PTA2<T: {}> = {...T, ...B2<T>};
//   ^
type EP1<T> = {|...P<T>, o: O|};
//   ^
type EP2<T> = {|o: O, ...P<T>|};
//   ^
type ECtor1 = {|...Ctor, o: O|};
//   ^
type ECtor2 = {|o: O, ...Ctor|};
//   ^
type PRec<X> = {o: O, ...PRec<X>};
//   ^
type IP1<T: {}> = {...B1<T>} & {...B2<T>};
//   ^ --expand-type-aliases
type Nest1<T: {}> = {...{...T}};
//   ^
type Nest2<T: {}> = {...{...{...T}}};
//   ^
type UNest<T: {}> = {...T} | {...{...T}} | {...{...{...T}}};
//   ^


declare var eobj2: EObj2; eobj2.z;

declare var c1: C1; c1.o;
declare var c2: C2; c2.o;
declare var ec1: EC1; ec1.o;
declare var ec2: EC2; ec2.o;
declare var ctor1: Ctor1; ctor1.o;

declare var p1_num: P1<number>; p1_num.o;


declare var rec: Rec; rec.o;
