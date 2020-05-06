/* This test exercises the abstract_targ logic used in the typeapp expansion
 * cache to detect loops involving implicitly instantiated type arguments */

type A<+T> = {
  m<U>(f: T => U): A<U>,
};

type B<+T> = {
  m<U>(f: T => U): B<U>,
}

declare var a: A<number>;
var b: B<number> = a;
