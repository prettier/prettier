// @flow


class Foo<+T> {}

class Bar<-T> {}

class Baz<T> {}

class FooBarBaz<S, +T, -U> {}

opaque type Bad1<-T> = Foo<T>; // Error: Foo expects covariant type
opaque type Bad2<+T> = Bar<T>; // Error: Bar expects contravariant type
opaque type Bad3<-T> = Baz<T>; // Error: Baz expects invariant type
opaque type Bad4<+T> = Baz<T>; // Error: Baz expects invariant type

// Note: Invariant can flow to contravariant/covariant in the declarations.

export opaque type Covariant<+T> = Foo<T>;
export opaque type Contravariant<-T> = Bar<T>;
export opaque type Invariant<T> = Baz<T>;
export opaque type All<S,+T,-U> = FooBarBaz<S,T,U>;
