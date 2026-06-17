// @flow

type A1 = (
  this: | SupperLongLongLongLongLongLongLongLongLongLongLongLongLongType | FooBarBazLorem12345,
  b: number,
) => boolean;

type A2 = (
  _this: | SupperLongLongLongLongLongLongLongLongLongLongLongLongLongType | FooBarBazLorem12345,
  b: number,
) => boolean

type A3 = (
  | SupperLongLongLongLongLongLongLongLongLongLongLongLongLongType | FooBarBazLorem12345,
  b: number,
) => boolean
