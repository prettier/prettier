// @flow

type A = $ObjMapi<{ FOO: null }, <K>(k: K) => K>;
declare var a: A;

(a.FOO: 'FOO'); // ok
(a.FOO: 'BAR'); // error
a.FOO = 'BAR'; // error

type B = $ObjMap<{ FOO: null }, <K>(k: K) => 'FOO'>;
declare var b: B;

(b.FOO : 'FOO'); // ok
(b.FOO : 'BAR'); // error
b.FOO = 'BAR'; // error

type C = $TupleMap<[mixed, mixed], <K>(k: K) => 'FOO'>;
declare var c: C;

(c[0]: 'FOO'); // ok
(c[0]: 'BAR'); // error
c[0] = 'BAR'; // error
