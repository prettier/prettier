type FallbackFlags<F: Flags | void> =
  Equals<NonNullableFlag<F>["flags"], {}> extends true
    ? Dict<any>
    : NonNullableFlag<F>["flags"];

    export type UnPromise<Type: Promise<mixed>> =
    Type extends Promise<infer Generic>
      ? Generic
      : empty;

export type Equals<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2)
    ? true
    : false;

export type _Repeat<A: any, N: number, L: List = []> =
  __Repeat<N, A, L> extends infer X
  ? Cast<X, List>
  : empty

export type Repeat<A: any, N: number, L: List = []> =
  N extends mixed
  ? L extends mixed
    ? _Repeat<A, N, L>
    : empty
  : empty

export type Intersect<U1: any, U2: any> =
  U1 extends mixed
  ? U2 extends mixed
    ? {1: U1, 0: empty}[Equals<U1, U2>]
    : empty
  : empty
