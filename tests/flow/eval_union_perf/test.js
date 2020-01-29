//@flow

import type {UnionElementOne} from './type.js'

export type UnionElementTwo = Info<{
  foo: $DeepReadOnly<{
    foo: boolean,


  }>,
  bar:
    | {|
        type: 'A',
        data: string,
      |}
    | {|type: 'B'|}
    | {|type: 'C'|},
  baz: $DeepReadOnly<{

  }>,
}>;

type Elements = {
  one: UnionElementOne,
  two: UnionElementTwo,
};

export type NoBar =
  | BarOne
  | BarTwo
  | BarThree;

type DeepReadOnlyFn = (<T>(Array<T>) => $ReadOnlyArray<$DeepReadOnly<T>>) &
  (<T: {}>(T) => $ReadOnly<$ObjMap<T, DeepReadOnlyFn>>) &
  (<T>(T) => T);

export type $DeepReadOnly<T> = $Call<DeepReadOnlyFn, T>;

export type Info<
  T: {+bar: {+type: string}},
> = $Call<
  <A>({bar: A}) => {
    bar:
      | BarOne
      | BarTwo
      | BarThree
      | $DeepReadOnly<$Exact<A>>,
  },
  T,
>;

type Bar<T> = $ElementType<T, 'bar'>;

type BarOne = $DeepReadOnly<{|
  type: 'one',
|}>;

type BarTwo = $DeepReadOnly<{|
  type: 'two',
|}>;
type BarThree = $DeepReadOnly<{|
  type: 'three',
|}>;
type BarFour = $DeepReadOnly<{|
  type: 'four',
|}>;

type BarFive = $DeepReadOnly<{|
  type: 'five',
|}>;
type BarSix = $DeepReadOnly<{|
  type: 'six',
|}>;
type BarSeven = $DeepReadOnly<{|
  type: 'seven',
|}>;

type BarUnion =
  | BarOne
  | BarTwo
  | BarThree
  | BarFour
  | BarFive
  | BarSix
  | BarSeven
  | $Values<$ObjMap<Elements, <T>(T) => Bar<T>>>;

type Config = {|
  f: (dispatch: (BarUnion) => void) => void,
  g: (dispatch: (BarUnion) => void) => void,
  h: (dispatch: (BarUnion) => void) => void,
|};

function test<X>(config: Config): Config {
  const {f, g, h} = config;

  return {
    f: dispatch => f(dispatch),
    g: dispatch => g(dispatch),
    h: dispatch => h(dispatch),
  };
}
