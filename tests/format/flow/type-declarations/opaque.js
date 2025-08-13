declare export opaque type Foo;
declare export opaque type Bar<T>;
declare export opaque type Baz: Foo;
declare export opaque type Foo1<T>: Bar<T>;
declare export opaque type Foo2<T>: Bar;
declare export opaque type Foo3: Bar<T>;
opaque type ID = string;
opaque type Foo4<T> = Bar<T>;
opaque type Maybe<T> = _Maybe<T, *>;
export opaque type Foo5 = number;
opaque type union =
 | {type: "A"}
 | {type: "B"};
opaque type overloads =
  & ((x: string) => number)
  & ((x: number) => string);

opaque type Counter super empty extends Box<T> = Container<T>;
opaque type Counter super Box<T> = Container<T>;

opaque type Counter super Looooooooooooooooooog extends BoxLooooooooooooooooooog<T> = Container<T>;
opaque type Counter super BoxLooooooooooooooooooooooooooooooooog<T> = Container<T>;

declare opaque type Counter super empty extends Box<T>;
declare opaque type Counter super Box<T>;
declare opaque type Counter super Looooooooooooooooooog extends BoxLooooooooooooooooooog<T>;
declare opaque type Counter super BoxLooooooooooooooooooooooooooooooooooooooooooooooog<T>;
