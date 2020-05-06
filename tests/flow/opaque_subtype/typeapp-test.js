//@flow
import type {Foo} from './typeapp-export';
function f(foo: Foo<string>): string {
  var foo2: Foo<string|null> = foo; // OK, by covariance
  foo2.p = null; // Error, covariant property p
  return foo.p;
}
