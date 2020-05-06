/**
 * This is a regression test for a fatal assertion that was found when comparing
 * a type with too many type args to itself. You would not be able to see the
 * error on line 12 since the fatal assertion would kill Flow.
 */

class T<U> {}
type V = T<*, *>; // Error
declare var x: V;
(x: V);

(42: empty); // Error: number ~> empty
