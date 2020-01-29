// @flow

type A = {|
  +f: ?{|
    +id: ?string,
  |}
|};

type Foo = $PropertyType<A, 'f'>;

type B = {|
  +f: ?{|
    +id: ?string,
  |}
|};

type Bar = $PropertyType<B, 'f'>;

const _ = (arg: Foo | Bar) => {
  if (arg == null) {
    return null;
  }
  const id = arg.id;
}
