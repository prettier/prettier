a = {
  parseFunctionBodyAndFinish<
    T =
      | N.Function
      | N.TSDeclareMethod
      | N.TSDeclareFunction
      | N.ClassPrivateMethod,
  >() {}
}

function parseFunctionBodyAndFinish<
  T =
    | N.Function
    | N.TSDeclareMethod
    | N.TSDeclareFunction
    | N.ClassPrivateMethod
    | Foo
    | Bar
    | Baz
>();

function parseFunctionBodyAndFinish<
  T = // comment
    N.Function | N.TSDeclareMethod | Baz
>();

function makeChainWalker<
  ArgT = {
    options: ValidatedOptions;
    dirname: string;
    filepath?: string;
  },
>() {}
