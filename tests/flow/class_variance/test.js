//@flow
class A<T> {
  p: T;
}
class B<+T> extends A<T> {} // Error: T used invariantly.
var b1: B<string> = new B;
var b2: B<string|null> = b1;
b2.p = null;
(b1.p: string);
