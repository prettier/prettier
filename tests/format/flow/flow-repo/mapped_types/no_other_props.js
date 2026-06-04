// Mapped types cannot have extra properties yet

type MappedFirst = {
  [key in keyof {foo: number}]: number, // ERROR
  prop: number,
};
type SliceFirst = {
  prop: number,
  [key in keyof {foo: number}]: number, // ERROR
};
type SpreadFirst = {
  ...{prop: number},
  [key in keyof {foo: number}]: number, // ERROR
};
type MappedLater1 = {
  ...{prop: number},
  foo: number,
  [key in keyof {foo: number}]: number, // ERROR
};
type MappedLater2 = {
  foo: number,
  ...{prop: number},
  foo: number,
  [key in keyof {foo: number}]: number, // ERROR
};
