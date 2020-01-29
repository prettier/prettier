// @flow

declare class C<P> {};

declare var typeof_C: typeof C;
() => typeof_C;

declare var class_of_C_number: Class<C<number>>;
() => class_of_C_number;
