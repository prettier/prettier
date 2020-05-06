function cond<T>(test: boolean, a: T, b: T): T {
  if (test) {
    return a;
  } else {
    return b;
  }
}

declare var test: boolean;

// T is implicitly instantiated and will widen based on inputs
(cond(test, 0, ""): void); // errors: number|string ~> void

// T is explicitly instantiated to number
(cond<number>(test, 0, ""): void); // error: string ~> number, number ~> void

// can't explicitly instantiate non-poly functions
function f() {}
f<number>(); // error: expected polymorphic type

// object ~> explicit instantiation of property identifier call
declare var o1: { m<T>(x: T): T };
(o1.m<string>(0): void); // error: number ~> string, string ~> void

// object ~> explicit instantiation of property expression call
declare var o2: { [string]: <T>(x: T) => T };
(o2.m<string>(0): void); // error: number ~> string, string ~> void

// instance ~> explicit instantiation of property identifier call
declare class O3 { m<T>(x: T): T }
declare var o3: O3;
(o3.m<string>(0): void); // error: number ~> string, string ~> void

// instance ~> explicit instantiation of property expression call
/* TODO: calling computed properties on instances is broken at the moment
declare class O4 { [string]: <T>(x: T) => T }
declare var o4: O4;
(o4.m<string>(0): void); // error: number ~> string, string ~> void
*/

// super.m<T>()
class A { m<T>(x: T): T { return x } }
class B extends A {
  foo(x: number): void {
    return super.m<string>(x); // error: number ~> string, string ~> void
  }
}

// predicated calls
function pred<T>(x: T): T { return x };
if (pred<string>(0)) {} // number ~> string
