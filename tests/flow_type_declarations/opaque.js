declare export opaque type Foo;
declare export opaque type Bar<T>;
declare export opaque type Baz: Foo;
declare export opaque type Foo<T>: Bar<T>;
declare export opaque type Foo<T>: Bar;
declare export opaque type Foo: Bar<T>;
opaque type ID = string;
opaque type Foo<T> = Bar<T>;
opaque type Maybe<T> = _Maybe<T, *>;
export opaque type Foo = number;
opaque type union =
 | {type: "A"}
 | {type: "B"};
opaque type overloads =
  & ((x: string) => number)
  & ((x: number) => string);
