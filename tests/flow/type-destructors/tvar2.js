// @flow

class C<T> {x: T}

declare function fn<T>(x: C<T>): C<$PropertyType<T, 'foo'>>;

declare var c: C<{foo: {bar: any}}>;
const x = fn(c);

(x: C<{bar: mixed}>);
(x: C<{bar: empty}>);
