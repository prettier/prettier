/**
 * @format
 * @flow
 */

type P<O> = $PropertyType<O, 'p'>;
declare function fn1<O>(l: O): $ElementType<O, 'p'>;
declare function fn2<O>(l: O): ($ElementType<O, 'p'>) => void;
declare function fn3<O>(o: O): $PropertyType<O, 'p'>;
declare function fn4<O>(o: O): ($PropertyType<O, 'p'>) => void;

type A = $PropertyType<{}, 'p'>; // We should get an error on this line.
(null: A);

type B = P<{}>; // We should get an error on this line.
(null: B);

fn1({x: 42}); // We should get an error on this line.
fn1(null); // We should get an error on this line.

fn2({x: 42})(); // We should get an error on this line.
fn2(null)(); // We should get an error on this line.

fn3({x: 42}); // We should get an error on this line.
fn3(null); // We should get an error on this line.

fn4({x: 42})(); // We should get an error on this line.
fn4(null)(); // We should get an error on this line.
