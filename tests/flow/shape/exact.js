// @flow

type State = {|
  foo: string,
|};

declare function update(
  bar: ($Shape<State>) => number,
): void;

update((prevState: State) => 0);

type ShapeState = $Shape<{|
  foo: string,
|}>;

declare function update2(
  bar: ($Exact<ShapeState>) => number,
): void;

update2((prevState: ShapeState) => 0);
