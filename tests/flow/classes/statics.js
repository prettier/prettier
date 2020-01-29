/* @flow */

class C {
  static p: string;
}
C.p = "hi";

// Class static fields are compatible with object types
(C: {p:string}); // ok
(C: {p:number}); // errors, string ~> number & vice versa (unify)

declare var o: {p:number};
(o: Class<C>); // error, object type incompatible with class type

class Dup1 {
  static x: string;
  static x() {}
}
(Dup1.x: empty); // function ~> empty

class Dup2 {
  static x() {}
  static x: string;
}
(Dup2.x: empty); // string ~> empty
