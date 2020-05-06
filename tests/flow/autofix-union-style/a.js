// @flow

declare var cond: boolean;
declare var cond2: boolean;
declare var cond3: boolean;

module.exports = {
  b1: () =>
    (cond ? true : true),
  b2: () =>
    (cond ? false : false),
  b3: () =>
    (cond ? true : false),
  b4: () =>
    (cond ? false : true),
  b5: (b: bool) =>
    (cond ? b : true),
  b6: (b: bool) =>
    (cond ? false : b),
  b7: (t: mixed) =>
    (cond ? false: t),
  b8: (e: empty) =>
    (cond ? false : e),
  b9: (a: any) =>
    (cond ? false : a),
  n1: () =>
    (cond ? 0 : 1),
  n2: () =>
    (cond ? 0 : (cond ? 1 : (cond ? 0 : 1))),
  n3: (n : number) =>
    (cond ? 0 : (cond2 ? 1 : (cond3 ? 0 : n))),
  s1: () =>
    (cond ? "0" : "1"),
  s2: () =>
    (cond ? "0" : (cond ? "1" : (cond ? "0" : "1"))),
  s3: (s : string) =>
    (cond ? "0" : (cond2 ? "1" : (cond3 ? s : "1"))),
  a1: (x:any) =>
    (cond ? x.f : x),
  a2: (n : number, s : string) =>
    cond ? (cond2 ? "0" : 0) : (cond3 ? n : s),


  o2: () =>
    cond ? {x: true} : {x: false},
}
