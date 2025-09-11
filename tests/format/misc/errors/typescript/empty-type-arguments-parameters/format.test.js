runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      "foo<>()",
      "(foo<>())",
      "new Foo<>()",
      "function foo<>(){}",
      "(function foo<>(){})",
      "class Foo<> {}",
      "(class Foo<> {})",
      "class Foo {constructor<>()}",
      "(class Foo {constructor<>()})",
      "class Foo {method<>()}",
      "(class Foo {method<>()})",
      "class Foo {get getter<>()}",
      "(class Foo {get getter<>()})",
      "class Foo {property: Bar<> = 1}",
      "(class Foo {property: Bar<> = 1})",
      "interface Foo<> {}",
      "interface Foo {bar<>()}",
      "interface Foo {<>(): boolean}",
      "const foo: Foo<> = 1",
      "type Foo = <>() => {}",
    ],
  },
  [
    "typescript",
    "babel-ts",
    // TODO[@fisker]: Unable on this parser
    // "oxc-ts",
  ],
);
