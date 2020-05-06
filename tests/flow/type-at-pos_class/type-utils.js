// @flow

declare class C<P> {};

declare var typeof_C: typeof C;
declare var class_of_C_number: Class<C<number>>;

declare class A {};

declare var class_a: Class<A>;
declare var class_class_a: Class<Class<A>>;
declare var class_class_class_a: Class<Class<Class<A>>>;
