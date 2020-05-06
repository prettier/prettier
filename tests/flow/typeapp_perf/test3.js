/* This test ensures that the typeapp instantiation cache doesn't erroneously
 * equate separate typeapps. Otherwise, we would cache the T=string
 * instantiation in the first arm of the union, then T=number in the second. */

declare class C<T> { m(): T }
declare var x: C<string> | C<number>;
(x.m(): empty); // error: string ~> empty, number ~> empty
