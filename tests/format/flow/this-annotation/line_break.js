// @flow

type T = (this: boolean,
          a: number,

          b: number,
         ) => boolean;

type T2 = (_this: boolean,
          a: number,

          b: number,
         ) => boolean;

type A = (
  this: SupperLongLongLongLongLongLongLongLongLongLongLongType,

  b: number,
) => boolean;

type B = (
  _this: SupperLongLongLongLongLongLongLongLongLongLongLongType,

  b: number,
) => boolean
