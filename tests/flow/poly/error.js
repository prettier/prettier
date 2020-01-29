/**
 * @format
 * @flow
 */

declare function fn1<T>(x: (T) => void): T => void;
const newFn1 = fn1((x: number) => {});
newFn1('string'); // The error should point here.

declare function fn2<T>(x: T): ((T) => void) => void;
const newFn2 = fn2(42);
newFn2((x: string) => {});

declare function fn3<T>(x: T, y: (T) => void): void;
fn3(42, (x: string) => {}); // The error should point to 42 and not string.

declare function fn4<T>(): [T, (T) => void];
const [newVal4, newFn4] = fn4();
newFn4(42);
(newVal4: string); // The error should point here.
