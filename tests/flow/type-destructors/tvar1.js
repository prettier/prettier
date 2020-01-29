// @flow

declare function fn<T>(x: T): $PropertyType<T, 'foo'>;

declare var c: {foo: {bar: any}};
const x = fn(c);

(x: {bar: mixed});
(x: {bar: empty});
