// @flow

declare class C<X> { }
type S<A, B> = (value: B) => S<A, C<B>>;
type T = { fn<A, B>(): S<A, B> };
