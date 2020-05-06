// @flow

declare opaque type O1;
declare opaque type O2;
declare opaque type O3;
declare opaque type O4;

type Obj1 = {
  (...args: $ReadOnlyArray<mixed>): void,
  f: <T>(x: T) => T
};

type Obj2 = {
  $call: (...args: $ReadOnlyArray<mixed>) => void, // named prop
  f: <T>(x: T) => T
};

type Obj3 = {
  [[call]]: (...args: $ReadOnlyArray<mixed>) => void,
  f: <T>(x: T) => T
};

type Obj4 = {
  (...args: $ReadOnlyArray<mixed>): O1,
  (...args: $ReadOnlyArray<mixed>): O2,
  $call: (...args: $ReadOnlyArray<mixed>) => O3, // named prop
  [[call]]: (...args: $ReadOnlyArray<mixed>) => O4,
  f: <T>(x: T) => T
};

type Obj5 = {
  [[call]]: (...args: $ReadOnlyArray<mixed>) => O4,
  $call: (...args: $ReadOnlyArray<mixed>) => O3, // named prop
  (...args: $ReadOnlyArray<mixed>): O1,
  (...args: $ReadOnlyArray<mixed>): O2,
  f: <T>(x: T) => T,
};
