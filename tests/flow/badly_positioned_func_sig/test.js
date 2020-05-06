// @flow

export type Bar = $Call<
  <T>({
    +blah: T,
  }) => T,
  {+blah: number},
>;

class X {
  foo: {|bar: Bar|} = {bar: 'cat'};
}
