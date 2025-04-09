// @flow

type A = (
  this: | SupperLongLongLongLongLongLongLongLongLongLongLongType | FooBarBazLorem12345,
  b: number,
) => boolean;

type B = (
  _this: | SupperLongLongLongLongLongLongLongLongLongLongLongType | FooBarBazLorem12345,
  b: number,
) => boolean
