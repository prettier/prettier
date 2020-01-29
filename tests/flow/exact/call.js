/* @flow */

type DeepNestedMaybes = {|
  a: ?{|
    b: ?string,
  |},
  c: {|
    d: ?{|
      e: ?number,
    |},
  |},
  g: null,
|};

type ExtractMaybe = <T>(a: ?T) => T;
type ExtractNonNull<T> = $Call<ExtractMaybe, T>;

type G = ExtractNonNull<$PropertyType<DeepNestedMaybes, 'g'>>;


type C = ExtractNonNull<$PropertyType<DeepNestedMaybes, 'c'>>;
let c1: C = {
  f: '', // Should cause an error
  d: null,
};
let c2: $Exact<C> = {
  f: '',
  d: null,
};
