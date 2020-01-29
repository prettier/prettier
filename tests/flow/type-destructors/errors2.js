/**
 * @format
 * @flow
 */

(null: $PropertyType<{}, 'p'>); // Error should point here.

type A = $PropertyType<{}, 'p'>; // Error should point here.
(null: A);

type B<O> = $PropertyType<O, 'p'>;
type C = B<{}>; // Error should point here.
(null: C);

declare function f1<O>(o: O): $PropertyType<{}, 'p'>; // Error should point here.
declare function f2<O>(o: O): A;
declare function f3<O>(o: O): B<{}>; // Error should point here.
declare function f4<O>(o: O): $PropertyType<O, 'p'>;
declare function f5<O>(o: O): B<O>;

declare var o: {};
(f1(o): empty);
(f2(o): empty);
(f3(o): empty);
(f4(o): empty); // Error should point here.
(f5(o): empty); // Error should point here.
